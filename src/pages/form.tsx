import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Input,
  Box,
  Page,
  useSnackbar,
  Select,
  Avatar,
  useNavigate,
  Switch,
  Spinner,
} from "zmp-ui";
import { useRecoilState } from "recoil";
import { userInfo, getAccessToken } from "zmp-sdk";
import { userState } from "../state";
import { getUserInfo, followOA, getPhoneNumber } from "zmp-sdk/apis";
import { zmp } from "zmp-framework/react";
import { useSearchParams } from "react-router-dom";

type UserForm = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  gender: string;
  follow_oa: boolean;
  showFollow: boolean;
  idByOA: string;
};

const FormPage: React.FunctionComponent = () => {
  const [user, setUser] = useRecoilState<userInfo>(userState);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = React.useState<UserForm>({
    name: user.name,
    avatar: user.avatar,
    gender: user.gender,
    email: user.email,
    phone: user.phone,
    follow_oa: user.follow_oa,
    showFollow: true,
    idByOA: "",
  });
  const [formStatus, setFormStatus] = React.useState({
    name: "",
    phone: "",
    email: "",
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [zOAId, setZOAId] = useState("793939043841773543");
  const [portalId, setPortalId] = useState("561236459");
  const [propsId, setPropsId] = useState("565018027");
  const [propsWebId, setPropsWebId] = useState("564990729");

  useEffect(() => {
    // getPhoneNumberZalo();
    getUser();

    const portal_id = searchParams.get("portal_id") || "";
    const props_id = searchParams.get("prop_id") || "";
    const props_web_id = searchParams.get("prop_web_id") || "";
    const zaloOAId = searchParams.get("zoa_id") || "";

    if (portal_id) {
      setPortalId(portal_id);
    }

    if (props_id) {
      setPropsId(props_id);
    }

    if (props_web_id) {
      setPropsId(props_web_id);
    }

    if (zaloOAId) {
      setZOAId(zaloOAId);
    }
  }, []);

  const followOAAccount = (zaloOAId: string) => {
    followOA({
      id: zaloOAId,
      success: async (res) => {
        //fetch user info again to get idByOA
        await getUser(true);
      },
      fail: (err) => {
        console.log(err);
      },
    });
  };

  const getUser = async (changeForm=false) => {
    try {
      const { userInfo } = await getUserInfo({});
      
      if (userInfo.idByOA) {
        if (changeForm) {
          console.log({ ...user, ...form, ...userInfo, follow_oa: true });
          setForm((user) => ({ ...user, ...form, ...userInfo, follow_oa: true }));
        } else {
          setForm((user) => ({ ...user, ...form, ...userInfo, showFollow: false, follow_oa: true }));
        }
      } else {
        setForm((user) => ({ ...form, ...userInfo }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeInput = (field, value) => {
    if (field === "follow_oa" && value) {
      followOAAccount(zOAId);
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const exchangeTokenToPhoneNumber = async (token: string) => {
    const endpoint = "https://graph.zalo.me/v2.0/me/info";
    const userAccessToken = await getAccessToken();
    const secretKey = "I8OeJQ8pIu15E948hDRU";

    const response = await axios.get(endpoint, {
      headers: {
        access_token: userAccessToken,
        code: token,
        secret_key: secretKey,
      },
    });

    return response?.data?.data?.number;
  };

  const getPhoneNumberZalo = () => {
    getPhoneNumber({
      success: async (data) => {
        let { token } = data;

        if (token) {
          try {
            const phone = await exchangeTokenToPhoneNumber(token);

            if (phone) {
              handleChangeInput("phone", phone);
            }
          } catch (error) {
            console.error(error);
          }
        }
      },
      fail: (error) => {
        // Xử lý khi gọi api thất bại
        console.log(error);
      },
    });
  };

  const postDataToCDP = async (data: UserForm) => {
    const extra = {};
    for (const [key, value] of searchParams.entries()) {
      extra[key] = value;
    }

    const domain = `https://api.ants.tech/access/api/zalo/event`;
    const body = {
      ec: "lead_form",
      ea: "submit",
      items: [
        {
          type: "lead",
          id: new Date().getTime() + data.phone,
          ...data,
        },
      ],
      uid: data.phone,
      dims: {
        customer: {
          customer_id: data.phone,
          name: data.name,
        },
      },
      prop_id: propsId,
      portal_id: portalId,
      extra: {
        ...extra,
      },
    };

    await fetch(domain, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return true;
  };

  const handleSubmit = async () => {
    if (!form?.name || !form?.phone || !form.email) {
      setFormStatus((formStatus) => ({
        name: form?.name ? "success" : "error",
        phone: form?.phone ? "success" : "error",
        email: form?.email ? "success" : "error",
      }));

      return;
    }

    setLoading(true);

    console.log(form);

    // handle submit post data to CDP.
    const response = await postDataToCDP(form);

    if (response) {
      setLoading(false);
      // change route
      navigate("/thankyou");
    }
  };

  return (
    <Page className="page" title="Antsomi - Đăng kí tham dự event">
      <div className="section-container">
        <Box mr={6} flex flexDirection="row">
          <Box>
            <Avatar src={form.avatar} online story="default" />
          </Box>

          <Box ml={2} mt={4}>
            <p style={{ fontWeight: 600 }}>Xin chào {form?.name}</p>
          </Box>
        </Box>
      </div>

      <div className="section-container">
        <Box>
          <div id="cdp_zone"></div>
          <Input
            id="name"
            label="Họ và tên"
            type="text"
            status={formStatus?.name}
            errorText="Vui lòng nhập họ và tên"
            placeholder="Zalo"
            value={form?.name}
            onChange={(e) => handleChangeInput("name", e.target.value)}
          />
          <Input
            label="Số điện thoại"
            type="text"
            onFocus={getPhoneNumberZalo}
            status={formStatus?.phone}
            errorText="Vui lòng nhập số điện thoại"
            placeholder="849xxxxxxxx"
            value={form?.phone}
            onChange={(e) => handleChangeInput("phone", e.target.value)}
          />
          <Input
            label="Email"
            type="text"
            status={formStatus?.email}
            errorText="Vui lòng nhập email"
            placeholder="abc@antsomi.com"
            value={form?.email}
            onChange={(e) => handleChangeInput("email", e.target.value)}
          />

          {form?.showFollow ? (
            <Switch
              size="small"
              name="follow_oa"
              onChange={(e) => handleChangeInput("follow_oa", e.target.checked)}
              label="Theo dõi Highlands để nhận được nhanh nhất các thông tin khuyến mãi và voucher."
            />
          ) : null}

          <Box mt={4}>
            <Button fullWidth variant="primary" onClick={handleSubmit}>
              Submit {loading ? <Spinner visible /> : null}
            </Button>
          </Box>
        </Box>
      </div>
    </Page>
  );
};

export default FormPage;
