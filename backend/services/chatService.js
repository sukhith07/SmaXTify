import API from "./api";

export const getChats = async () => {
  const res = await API.get("/chats");
  return res.data;
};

export const createChat = async () => {
  const res = await API.post("/chats");
  return res.data;
};

export const deleteChat = async (id) => {
  await API.delete(`/chats/${id}`);
};

export const addMessage = async (chatId, role, text) => {
  const res = await API.post(`/chats/${chatId}/message`, {
    role,
    text,
  });

  return res.data;

 export const updateTitle = async (id, title) => {

  const res = await API.put(`/chats/${id}/title`, {
    title,
  });

  return res.data;

};
};