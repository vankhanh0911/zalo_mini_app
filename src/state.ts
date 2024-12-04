
import { atom } from "recoil";
import { userInfo } from 'zmp-sdk';

export const userState = atom<userInfo>({
  key: "user",
  default: {
    name: "",
    email: "",
    phone: "",
    avatar: "",
    gender: "",
    position: "",
    company: "",
    industry: "",
  }
})
