const TOKEN_KEY = 'token';
const USER_ID = 'userId';

const isLogin = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};
const getUserId = (): number=>{
  return Number(localStorage.getItem(USER_ID));
}

const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};
const setUserId = (id: number)=>{
  localStorage.setItem(USER_ID, id.toString());
}

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID);
};

export { isLogin, getToken, setToken, clearToken, setUserId, getUserId};
