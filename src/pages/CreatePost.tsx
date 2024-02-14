import { useState } from "react";
import { useCreatePostMutation } from "../redux/api"


export const CreatePost: React.FC = () => {
  const [createPost, createPostResult] = useCreatePostMutation();
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
  });

  return (
    <div>
      <h1>Create Post</h1>
      {createPostResult.isLoading && <div>Loading...</div>}
      {createPostResult.isError && <div>Error: {JSON.stringify(createPostResult.error)}</div>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost(postForm);
        }}
      >
        <input
          type="text"
          value={postForm.title}
          onChange={(e) => {
            setPostForm({
              ...postForm,
              title: e.target.value,
            });
          }}
        />
        <textarea
          value={postForm.content}
          onChange={(e) => {
            setPostForm({
              ...postForm,
              content: e.target.value,
            });
          }}
        />
        <button type="submit">Create Post</button>
      </form>
    </div>
  )
}