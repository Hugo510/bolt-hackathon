import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // Datos del usuario relacionado
  users?: {
    full_name: string;
    avatar_url?: string;
  };
  // Indica si el usuario actual ha dado like
  user_liked?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  users?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useCommunityPosts = (filters?: {
  category?: string;
  search?: string;
  userId?: string;
}) => {
  return useQuery({
    queryKey: ['community-posts', filters],
    queryFn: async (): Promise<CommunityPost[]> => {
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          users!inner(
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateCommunityPost = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (postData: {
      title: string;
      content: string;
      category: string;
    }) => {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          ...postData,
          user_id: user.auth_user_id,
          likes_count: 0,
          comments_count: 0,
        })
        .select(`
          *,
          users!inner(
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
};

export const useUpdateCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      updates,
    }: {
      postId: string;
      updates: Partial<Pick<CommunityPost, 'title' | 'content' | 'category'>>;
    }) => {
      const { data, error } = await supabase
        .from('community_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
};

export const useDeleteCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
};

export const useLikeCommunityPost = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('No authenticated user');

      // Incrementar contador de likes
      const { error } = await supabase.rpc('increment_post_likes', {
        post_id: postId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
};

export const usePostComments = (postId: string) => {
  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async (): Promise<PostComment[]> => {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          users!inner(
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!postId,
  });
};

export const useCreatePostComment = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.auth_user_id,
          content,
        })
        .select(`
          *,
          users!inner(
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Incrementar contador de comentarios en el post
      await supabase.rpc('increment_post_comments', {
        post_id: postId,
      });

      return data;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
};