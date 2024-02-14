import { baseApi } from "./baseApi";
import { UserWithToken } from '../../models';

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

export const { useLoginMutation } = authApi;