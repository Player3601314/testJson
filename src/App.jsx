import { useState, useEffect } from "react";
import api from "./api/posts";
import { useForm } from "react-hook-form";

function App() {
  const [posts, setPosts] = useState([]);
  const [modal, setModal] = useState(false);
  const [editPost, setEditPost] = useState(null); // Track the post being edited
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/posts");
        if (response && response.data) {
          setPosts(response.data);
        }
      } catch (error) {
        if (error.response) {
          console.error(error.response.data);
        } else {
          console.error(`Error: ${error.message}`);
        }
      }
    };
    fetchPosts();
  }, []);

  const onSubmit = async (data) => {
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
    const newPost = { id: id, title: data.title, body: data.textBody };
    try {
      const response = await api.post("/posts", newPost);
      setPosts([...posts, response.data]);
      setModal(false);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleEdit = async (data) => {
    if (editPost) {
      const updatedPost = { ...editPost, title: data.title, body: data.textBody };
      try {
        const response = await api.put(`/posts/${editPost.id}`, updatedPost);
        setPosts(posts.map(post => post.id === editPost.id ? response.data : post));
        setModal(false);
        setEditPost(null); // Reset after successful edit
      } catch (error) {
        console.error(error.message);
      }
    }
  };

  const openEditModal = (post) => {
    setEditPost(post);
    setValue("title", post.title);
    setValue("textBody", post.body);
    setModal(true);
  };

  return (
    <>
      <div className="w-full h-auto">
        <div className="flex justify-center items-center">
          <button
            onClick={() => {
              setEditPost(null); // Reset for new post
              setModal(true);
            }}
            className="px-4 py-2 my-5 rounded-full bg-blue-500 text-white"
          >
            Toggle Modal
          </button>
        </div>

        <div className="w-1/2 mx-auto flex flex-col">
          {posts.map((post) => (
            <div key={post.id} className="mb-4">
              <h4 className="text-lg font-bold text-green-500">{post.body}</h4>
              <p className="mt-4 text-green-500">{post.title}</p>
              <div className="w-[100%] h-auto flex justify-around">
                <button
                  onClick={() => openEditModal(post)}
                  className="py-[2px] px-[14px] bg-[#ff0] text-[#000] font-bold rounded-full"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(post.id)}
                  className="py-[2px] px-[14px] bg-[#f00] font-bold rounded-full"
                >
                  Delete
                </button>
              </div>
              <hr className="mt-2 mb-4 border-red-500" />
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="w-full h-full fixed top-0 left-0 bg-gray-500 bg-opacity-30 flex items-center justify-center">
          <form
            onSubmit={handleSubmit(editPost ? handleEdit : onSubmit)}
            className="w-1/2 bg-black p-5 rounded-lg flex flex-col items-center relative z-20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              {editPost ? "Edit Post" : "Create Post"}
            </h2>
            <input
              {...register("textBody", { required: "Text is required" })}
              className="px-4 py-2 mb-2 rounded-full text-black"
              placeholder="Text..."
              type="text"
            />
            {errors.textBody && <p className="text-red-500">{errors.textBody.message}</p>}
            <input
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 4,
                  message: "Title must be at least 4 characters"
                }
              })}
              className="px-4 py-2 mb-2 rounded-full text-black"
              placeholder="Title..."
              type="text"
            />
            {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            <button
              type="submit"
              className="py-2 px-4 rounded-full bg-blue-500 text-white mt-4"
            >
              Submit
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default App;
