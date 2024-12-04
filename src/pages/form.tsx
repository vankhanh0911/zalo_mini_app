import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input, Box, Page, useSnackbar, Select, Avatar, useNavigate, Switch, Spinner } from 'zmp-ui';
import { useRecoilState } from 'recoil';
import { userInfo, getAccessToken } from 'zmp-sdk';
import { userState } from '../state';
import { getUserInfo, followOA, getPhoneNumber } from "zmp-sdk/apis";
import { zmp } from "zmp-framework/react";
import { useSearchParams } from "react-router-dom";



type UserForm = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  gender: string;
  position: string;
  company: string;
  industry: string;
  follow_oa: boolean,
  showFollow: boolean
};

const FormPage: React.FunctionComponent = () => {
  const [user, setUser] = useRecoilState<userInfo>(userState)
  const [loading, setLoading] = useState(false);
  const [form, setForm] = React.useState<UserForm>({ name: user.name, avatar: user.avatar, gender: user.gender, email: user.email, phone: user.phone, company: user.company, position: user.position, industry: user.industry, follow_oa: user.follow_oa, showFollow: true });
  const [formStatus, setFormStatus] = React.useState({ name: '', phone: '', email: ''});
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [zOAId, setZOAId] = useState("793939043841773543");
  const [portalId, setPortalId] = useState('33167');
  const [propsId, setPropsId] = useState('556301423');
 

useEffect(() => {
  // getPhoneNumberZalo();
  getUser();

  const portal_id = searchParams.get('portal_id') || "";
  const props_id = searchParams.get('prop_id') || "";
  const zaloOAId = searchParams.get('zoa_id') || "";

  if (portal_id) {
    setPortalId(portal_id);
  }

  if (props_id) {
    setPropsId(props_id);
  }

  if (zaloOAId) {
    setZOAId(zaloOAId);
  }

}, []);

const followOAAccount = (zaloOAId: string) => {
  followOA({
    id: zaloOAId,
    success: (res) => {
      setForm({ ...form, follow_oa: true })
    },
    fail: (err) => {console.log(err);}
  });
}

const getUser = async () => {
  try {
    const { userInfo } = await getUserInfo({});

    if (userInfo.idByOA) {
      setForm((user) => ({ ...form, ...userInfo, showFollow: false }));
    } else {
      setForm((user) => ({ ...form, ...userInfo }));
    }
    
    
  } catch (error) {
    console.log(error);
  }
};

  const handleChangeInput = (field, value) => {
    if(field === 'follow_oa' && value) {
      followOAAccount(zOAId);
    } else {
      setForm({ ...form, [field]: value })
    }
  }

  const exchangeTokenToPhoneNumber = async (token: string) => {

    const endpoint = "https://graph.zalo.me/v2.0/me/info";
    const userAccessToken = await getAccessToken();
    const secretKey = "I8OeJQ8pIu15E948hDRU";

    const response = await axios.get(endpoint, {
      headers: {
        access_token: userAccessToken,
        code: token,
        secret_key: secretKey
      }
    });

    return response?.data?.data?.number;
    
  }

  const getPhoneNumberZalo = () => {
    getPhoneNumber({
      success: async (data) => {
        let { token } = data;

        if (token) {
          try {
            const phone = await exchangeTokenToPhoneNumber(token);

            if (phone) {
              handleChangeInput('phone', phone);
            }
          } catch (error) {
            console.error(error);
          }
        }
      },
      fail: (error) => {
        // Xử lý khi gọi api thất bại
        console.log(error);
      }
    });
  };

  const postDataToCDP = async (data: UserForm) => {
    const domain = `https://api.ants.tech/access/api/zalo/event`;
    const body = {
      ec: 'lead_form',
      ea: 'submit',
      items: [
        {
          type: 'lead',
          id: new Date().getTime() + data.phone,
          ...data
        }
      ],
      uid: data.phone,
      dims: {
        customer: {
          customer_id: data.phone,
          name: data.name
        }
      },
      prop_id: propsId,
      portal_id: portalId,
    };

    await fetch(domain, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    return true;

  }

  const handleSubmit = async () => {
    if (!form?.name || !form?.phone || !form.email) {
      setFormStatus((formStatus) => ({
        name: form?.name ? 'success' : 'error',
        phone: form?.phone ? 'success' : 'error',
        email: form?.email ? 'success' : 'error',
      }));

      return;
    }

    setLoading(true);

    // handle submit post data to CDP.
    const response = await postDataToCDP(form);

    if (response) {
      setLoading(false);
      // change route
      navigate('/thankyou');
    }
    
  }
  
  return (
    <Page className="page" title='Antsomi - Đăng kí tham dự event'>
      <div className='section-container'>
        <Box mr={6} flex flexDirection="row">
            <Box>
              <Avatar src={form.avatar} online story="default" />
            </Box>

            <Box ml={2} mt={2}>
              <p style={{fontWeight: 600}}>Xin chào {form?.name}</p>
              <p style={{fontSize: '10px'}}>@antsomi.com</p>
            </Box>
        </Box>
      </div>
      
      <div className='section-container'>
        <Box>
          <img
          src='https://www.antsomi.com/wp-content/uploads/2021/05/IJM-InnoTechDay-Banner.png'
          width={'100%'}
          />
          <Input
            id="name"
            label="Họ và tên"
            type="text"
            status={formStatus?.name}
            errorText="Vui lòng nhập họ và tên"
            placeholder="Zalo"
            value={form?.name}
            onChange={(e) => handleChangeInput('name', e.target.value)}
          />
          <Input
            label="Số điện thoại"
            type="text"
            onFocus={getPhoneNumberZalo}
            status={formStatus?.phone}
            errorText="Vui lòng nhập số điện thoại"
            placeholder="849xxxxxxxx"
            value={form?.phone}
            onChange={(e) => handleChangeInput('phone', e.target.value)}
          />
          <Input
            label="Email"
            type="text"
            status={formStatus?.email}
            errorText="Vui lòng nhập email"
            placeholder="abc@antsomi.com"
            value={form?.email}
            onChange={(e) => handleChangeInput('email', e.target.value)}
          />
          <Select
            label="Chức vụ"
            defaultValue="chon"
            value={form?.position}
            onChange={(e) => handleChangeInput('position', e)}
          >
            <Option value="chon" title="-chọn-" />
            <Option value="clevel" title="C-Level" />
            <Option value="manager" title="Manager" />
            <Option value="senior" title="Senior" />
            <Option value="staff" title="Staff" />
            <Option value="student" title="Student" />
          </Select>
          <Input
            label="Đơn vị"
            type="text"
            placeholder="Antsomi"
            value={form?.company}
            onChange={(e) => handleChangeInput('company', e.target.value)}
          />
          <Select
            label="Ngành nghề"
            defaultValue="chon"
            value={form?.industry}
            onChange={(e) => handleChangeInput('industry', e)}
          >
            <Option value="chon" title="-chọn-" />
            <Option value="fmcg" title="FMCG" />
            <Option value="retail" title="Retail" />
            <Option value="education" title="Education" />
            <Option value="banking" title="Banking" />
            <Option value="pharma" title="Pharma" />
            <Option value="other" title="Khác" />
          </Select>

          {form?.showFollow ? (<Switch 
          size="small" 
          name='follow_oa'
          onChange={(e) => handleChangeInput('follow_oa', e.target.checked)}
          label="Theo dõi Antsomi để nhận đưuọc nhanh nhất các thông tin khuyến mãi và voucher." 
          />) : null}
          
          <Box mt={4}>
            <Button fullWidth variant='primary' onClick={handleSubmit}>
              Submit {loading ? (<Spinner visible />) : null}
            </Button>
          </Box>
        </Box>
      </div>
    </Page>
  )
}

export default FormPage;