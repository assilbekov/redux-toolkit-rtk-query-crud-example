import { Post } from "../../models";

export type ListPostsResponse = {
    posts: Post[];
    total: number;
    skip: number;
    limit: number;
};

export type SearchPostsRequest = {
    skip: number;
    limit: number;
}