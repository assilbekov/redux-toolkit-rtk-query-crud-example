import { Post } from "../../models";
import { baseApi } from "./baseApi";
import type { SearchPostsRequest, ListPostsResponse } from "./posts.type";

export const postsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listPosts: build.query<ListPostsResponse, void>({
      query: () => 'auth/posts',
      providesTags: [{ type: 'Post', id: 'LIST' }],
    }),
    searchPosts: build.query<ListPostsResponse, SearchPostsRequest>({
      query: (request) => ({
        url: `auth/posts?skip=${request.skip}&limit=${request.limit}`,
        method: 'GET',
      }),
      // Don't need search data after 60 seconds.
      keepUnusedDataFor: 60,
      providesTags: [{ type: 'Post', id: 'SEARCH_LIST' }],
    }),
    getPost: build.query<Post, number>({
      query: (id) => `posts/${id}`,
      providesTags: result => [{ type: 'Post', id: `postId:${result?.id}` }],
    }),
    createPost: build.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: 'posts',
        method: 'POST',
        body,
      }),
      // Invalidates SEARCH_LIST cache. Deletes data from the store.
      invalidatesTags: [{ type: 'Post', id: 'SEARCH_LIST' }],
    }),
    updatePost: build.mutation<Post, Post>({
      query: (body) => ({
        url: `posts/${body.id}`,
        method: 'PUT',
        body,
      }),
      // Invalidates postId and SEARCH_LIST cache.
      invalidatesTags: (result, error, body) => [{ type: 'Post', id: `postId:${body.id}` }, { type: 'Post', id: 'SEARCH_LIST' }],
    }),
    deletePost: build.mutation<void, number>({
      query: (id) => ({
        url: `posts/${id}`,
        method: 'DELETE',
      }),
      // Invalidates postId and SEARCH_LIST cache.
      invalidatesTags: (result, error, id) => [{ type: 'Post', id: `postId:${id}` }, { type: 'Post', id: 'SEARCH_LIST' }],
      // Removes the post from the list.
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            postsApi.util.updateQueryData('listPosts', undefined, (draft) => {
              draft.posts = draft.posts.filter((post) => post.id !== postId)
            })
          )
        } catch {}
      },
    }),
  }),
});

export const { 
  useListPostsQuery,
  useSearchPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postsApi;