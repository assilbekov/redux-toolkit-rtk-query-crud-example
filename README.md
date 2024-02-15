## Why use redux toolkit rtk query
- Simplify the API layer of your application. 
- Cover the basic CRUD functionality without writing much of boilerplate code. 
- Easily store and access data. No need to write selectors anymore. No need to check data validity. No need to worry about many components doing the same data fetching.
- As redux-based alternative to [React Query](https://tanstack.com/query/v3/), [SWR](https://swr.vercel.app/), [Apollo](https://www.apollographql.com/), and [Urql](https://commerce.nearform.com/open-source/urql/).

## Why not to use redux toolkit rtk query.
- In most cases you may not need redux at all. I'd suggest you trying [React Query](https://tanstack.com/query/v3/) with [React Context](https://react.dev/learn/passing-data-deeply-with-context) instead.
- If you use redux to store (cache) and get access to data from you Backend use [React Query](https://tanstack.com/query/v3/). 
- If you use redux to manipulate state of you App and teleport data deep inside of your app use built in React tool [React Context](https://react.dev/learn/passing-data-deeply-with-context).
- It's higlt opinionated library, hard to customize compared to other fetching libraries.


## Description
- This repo is a redux-toolkit RTK query crud example.
- Auth and cache search are covered. 
- Fully on Typescript.
- https://dummyjson.com/ used as backend service. https://dummyjson.com/docs/auth for auth service.

## How to work with CRUD using redux toolkit rtq query.
Keep in mind that some of URLs here are protected and we pass our access tokens there. We'll discuss how to acomplish this later here.
### Fetch data.
When fetching data in you api layer define query and tags like:
```
export type ListPostsResponse = {
    posts: Post[];
    total: number;
    skip: number;
    limit: number;
};


listPosts: build.query<ListPostsResponse, void>({
    query: () => 'auth/posts',
    providesTags: [{ type: 'Post', id: 'LIST' }],
})

getPost: build.query<Post, number>({
    query: (id) => `posts/${id}`,
    providesTags: result => [{ type: 'Post', id: `postId:${result?.id}` }],
})

export type SearchPostsRequest = {
    skip: number;
    limit: number;
}

searchPosts: build.query<ListPostsResponse, SearchPostsRequest>({
    query: (request) => ({
      url: `auth/posts?skip=${request.skip}&limit=${request.limit}`,
      method: 'GET',
    }),
    // Don't need search data after 60 seconds.
    keepUnusedDataFor: 60,
    providesTags: [{ type: 'Post', id: 'SEARCH_LIST' }],
})
```
- `query` is used by your app to modify URL or params you're passing to your data fetching function (`baseQuery` in `redux/api/baseApi`). It can be return `string`, `object`. For more infornation [read rtk queries doc](https://redux-toolkit.js.org/rtk-query/usage/queries). 
- `providesTags` is a helping information allowing rtk-query understand how to store (cache) data. Pay attention to `providesTags: result => [{ type: 'Post', id: 'postId:${result?.id}' }]` we use dynamic tags there. If we update data by executing `CREATE`, `DELETE` or `UPDATE` we may provide `invalidatesTags` there, so rtk-query will know, that when stored (cached) data isn't valid anymore and we need to refetch data. We'll see it later. [Read this for more information](https://redux-toolkit.js.org/rtk-query/usage/automated-refetching).
- In the example above `ListPostsResponse` is the type definition of what our Backend will return us as a response. In `build.query` we pass it as a first generic so we'll know the reponse when accessing data. 
- In the example above `SearchPostsRequest` is the type definition of what request looks like. We'll need to pass that data when calling fetching hook. `useSearchPostsQuery` in that case.
- `keepUnusedDataFor` This is how long RTK Query will keep your data cached for after the last component unsubscribes. [Read this for more information](https://redux-toolkit.js.org/rtk-query/usage/cache-behavior).

In order to use this fetching tools we need to export hooks like
```
export const { 
  useListPostsQuery,
  useSearchPostsQuery,
  useGetPostQuery,
} = postsApi;
```
then we can use it in our components like 
- `const { data, error, isLoading, isFetching } = useSearchPostsQuery({ skip: page * LIMIT, limit: LIMIT });`
- `const { data, error, isLoading, isFetching } = useGetPostQuery(postId || 0, { skip: !postId });`
- `const { data, error, isLoading, isFetching } = useListPostsQuery();`

What's good about that hooks are:
- We don't have to call api from `useEffect` anymore and we don't have to handle the API state in our app.
- We don't have to worry about multiple compoents running the same the same call. Only one networking call will be executed. A new call will fired when a stored (cached data) will be invalidated.

### Create, Update, Delete (Mutate) data. 
```
createPost: build.mutation<Post, Partial<Post>>({
    query: (body) => ({
        url: 'posts',
        method: 'POST',
        body,
    }),
    // Invalidates LIST cache. Deletes data from the store.
    invalidatesTags: [{ type: 'Post', id: 'LIST' }],
}),
updatePost: build.mutation<Post, Post>({
    query: (body) => ({
        url: `posts/${body.id}`,
        method: 'PUT',
        body,
    }),
    // Invalidates postId and LIST cache.
    invalidatesTags: (result, error, body) => [{ type: 'Post', id: `postId:${body.id}` }, { type: 'Post', id: 'LIST' }],
}),
```
Create and Update are pretty straitforvard. What's different is:
- It's not `build.query` anymore it's `build.mutation`. The hook from `query` will be runned immidiatly and `mutation` will return `[handler, executionState]`. Use `handler` in your app to run a call and pass data, `Partial<Post>` for `create` and `Post` for `update`. [Read this for more](https://redux-toolkit.js.org/rtk-query/usage/mutations).
- After we successfully run `create`, `update` or `delete` data in our app, data in our Backend should be changed. So we should inform our app to refetch data. (It'll be runned when we navigate to a page where we need to fetch data). In order to accomplish this we need to pass `invalidatesTags`
    - In `createPost` we only invalidate our list. So when we navigate back to a list page, or if we need to fetch a `listPosts` in our currently rendered components rtl-query will run fetching in `useListPostsQuery` again.
    - In `updatePost` more data is invalidated. `(result, error, body) => [{ type: 'Post', id: 'postId:${body.id}' }, { type: 'Post', id: 'LIST' }],`. 

For educational purpose our `deletePost` acts differently.
```
deletePost: build.mutation<void, number>({
    query: (id) => ({
        url: `posts/${id}`,
        method: 'DELETE',
    }),
    // Invalidates postId cache.
    invalidatesTags: (result, error, id) => [{ type: 'Post', id: `postId:${id}` }],
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
})
```
Here we only invalidate data stored by `getPost`. We may not need to invalidate certain requests and handle data update by our own way. To acomplish this we first wait for promise to resolve `await queryFulfilled`. And when it does we manually update data stored by `listPosts` doing:
```
dispatch(
    postsApi.util.updateQueryData('listPosts', undefined, (draft) => {
        draft.posts = draft.posts.filter((post) => post.id !== postId)
    })
)
```

### Authentication
To login into an app we use `auth/login` endpoint
```
export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<UserWithToken, { username: string, password: string }>({
      query: (body) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
    }),
  }),
});
```
Then we store it in our `authSlice` slice by
```
builder.
    addMatcher(authApi.endpoints.login.matchPending, (state, action) => {
        console.log('pending', action)
    }).
    addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.user = action.payload;
    })
    .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        console.log('rejected', action)
    })
```
And finally we use that token to make our requests:
```
prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.user?.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
}
```
Our login process is as simple as
```
const [loginForm, setLoginForm] = useState<LoginRequest>({
    username: "kminchelle",
    password: "0lelplR",
});
const [login, {isLoading, error, isError}] = useLoginMutation();

// Render starts..
<form
    onSubmit={(e) => {
        e.preventDefault();
        login(loginForm);
    }}
>
// Render continues..
```

## Some usefull topics:
- Usefull kitchen example [here](https://codesandbox.io/p/sandbox/github/reduxjs/redux-toolkit/tree/master/examples/query/react/kitchen-sink?file=%2Fsrc%2Fapp%2Fservices%2Fposts.ts&from-embed=). The example may be too big and overwelmed. So I made a simpler version with explanation of our flow.
- For more customization [read](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries).
- If you want to use axios [read](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#axios-basequery)
- For graphql [read](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#graphql-basequery).
- [Polling](https://redux-toolkit.js.org/rtk-query/usage/polling).
- [Prefetching](https://redux-toolkit.js.org/rtk-query/usage/prefetching).

## Scripts

- `dev`/`start` - start dev server and open browser
- `build` - build for production
- `preview` - locally preview production build
- `test` - launch test runner
