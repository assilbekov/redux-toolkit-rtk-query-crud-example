import { useState } from "react";
import {
  useDeletePostMutation,
  useGetPostQuery,
  useUpdatePostMutation
} from "../redux/api";


type PostPageProps = {
  postId: number | null;
}

export const PostPage: React.FC<PostPageProps> = ({ postId }) => {
  const { data, error, isLoading, isFetching } = useGetPostQuery(postId || 0, { skip: !postId });
  const [updatePost, updatePostResult] = useUpdatePostMutation();
  const [deletePost, deletePostResult] = useDeletePostMutation();

  const [newContent, setNewContent] = useState("")

  return (
    <div>
      <h1>Post Page</h1>
      {isLoading && <div>Loading...</div>}
      {isFetching && <div>Fetching...</div>}
      {error && <div>Error: {JSON.stringify(error)}</div>}
      {updatePostResult.isLoading && <div>Updating...</div>}
      {deletePostResult.isLoading && <div>Deleting...</div>}
      {data ? (
        <div>
          <h2>{data.title}</h2>
          <p>{data.body}</p>
          <p>Post Form {postId}</p>
          <form onSubmit={e => {
            e.preventDefault();
            updatePost({ ...data, body: newContent });
          }}>
            <input type="text" value={newContent} onChange={(e) => setNewContent(e.target.value)} />
            <button type="submit" onClick={() => updatePost({ ...data, body: newContent })}>Update</button>
            <button type="button" onClick={() => deletePost(data.id)}>Delete</button>
          </form>
        </div>
      ) : (
        <p>No post selected</p>
      )}
    </div>
  )
}