import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiFieldErrors, getApiErrorMessage, getApiFieldErrors } from '../../api/errors';
import { dataService } from '../../services/dataService';
import { UserProfile } from '../../types';
import { parseTagInput } from './article.utils';

interface UsePostEditorOptions {
  id?: string;
  user: UserProfile | null;
  authLoading: boolean;
  isAdmin: boolean;
}

function removeFieldError(fieldErrors: ApiFieldErrors, fields: string[]): ApiFieldErrors {
  const nextFieldErrors = { ...fieldErrors };
  fields.forEach((field) => {
    delete nextFieldErrors[field];
  });
  return nextFieldErrors;
}

export function usePostEditor({ id, user, authLoading, isAdmin }: UsePostEditorOptions) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<number>(1);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});
  const [fieldErrorVersion, setFieldErrorVersion] = useState(0);

  const updateTitle = (value: string) => {
    setTitle(value);
    setErrorMessage(null);
    setFieldErrors((current) => removeFieldError(current, ['title']));
  };

  const updateContent = (value: string) => {
    setContent(value);
    setErrorMessage(null);
    setFieldErrors((current) => removeFieldError(current, ['content']));
  };

  const updateCategoryId = (value: number | null) => {
    setCategoryId(value);
    setErrorMessage(null);
    setFieldErrors((current) => removeFieldError(current, ['categoryId']));
  };

  const updateTags = (value: string) => {
    setTags(value);
    setErrorMessage(null);
    setFieldErrors((current) => removeFieldError(current, ['tagNames', 'tags']));
  };

  useEffect(() => {
    async function fetchPost() {
      if (!id || !user) {
        return;
      }

      try {
        const data = await dataService.getArticleDetail(Number(id));
        if (data.authorId !== user.id && !isAdmin) {
          navigate('/');
          return;
        }
        setTitle(data.title);
        setContent(data.content);
        setCategoryId(data.categoryId);
        setTags(data.tags.map((tag) => tag.name).join(', '));
        setStatus(data.status);
      } catch (error) {
        console.error('Error fetching post:', error);
        navigate('/');
      }
    }

    if (authLoading) {
      return;
    }
    if (!user || isAdmin) {
      navigate(user ? '/' : '/auth');
      return;
    }
    fetchPost();
  }, [authLoading, id, isAdmin, navigate, user]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (!categoryId) {
      setFieldErrors({ categoryId: '请选择有效分类。' });
      setFieldErrorVersion((version) => version + 1);
      setErrorMessage(null);
      return;
    }
    setErrorMessage(null);
    setFieldErrors({});
    setLoading(true);

    const articleData = {
      title,
      content,
      categoryId,
      tagNames: parseTagInput(tags),
    };

    try {
      if (id) {
        await dataService.updateArticle(Number(id), articleData);
        navigate(`/post/${id}`);
        return;
      }

      const post = status === 0
        ? await dataService.createDraft(articleData)
        : await dataService.createArticle({ ...articleData, visibility: 0 });
      navigate(`/post/${post.id}`);
    } catch (error) {
      console.error('Error saving post:', error);
      const nextFieldErrors = getApiFieldErrors(error);
      setFieldErrors(nextFieldErrors);
      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrorVersion((version) => version + 1);
        setErrorMessage(null);
      } else {
        setErrorMessage(getApiErrorMessage(error, '保存失败，请检查文章标题、正文、分类和标签是否符合要求。'));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    title,
    setTitle: updateTitle,
    content,
    setContent: updateContent,
    categoryId,
    setCategoryId: updateCategoryId,
    tags,
    setTags: updateTags,
    status,
    setStatus,
    isPreview,
    setIsPreview,
    loading,
    errorMessage,
    fieldErrors,
    fieldErrorVersion,
    handleSave,
  };
}
