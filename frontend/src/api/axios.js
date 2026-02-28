import axios from 'axios';

// 1. 기본 설정
const BASE_URL = 'http://43.201.xxx.xxx:8080'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // API 요청 타임아웃 (GPT 연동 등을 고려해 60초로 설정)
  timeout: 60000, 
});

// 2. 요청 인터셉터: 서버로 보낼 때 토큰을 자동으로 헤더에 장착
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 스프링 시큐리티의 Bearer 토큰 방식을 준수합니다.
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 응답 인터셉터: 서버에서 오는 응답/에러를 가공
api.interceptors.response.use(
  (response) => {
    // 성공적인 응답은 그대로 반환
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      // 디버깅을 위해 에러 내용을 콘솔에 찍음
      console.error(`[API Error] Status: ${status}`, error.response.data);

      // 🛑 401 (Unauthorized): 토큰이 만료되었거나 없을 때만 로그아웃 시킴
      if (status === 401) {
        console.warn("인증 세션이 만료되었습니다. 다시 로그인해주세요.");
        
        // 로컬 스토리지 정리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        
        // 사용자 알림 후 로그인 페이지로 이동
        alert("로그인 세션이 만료되었습니다.");
        window.location.href = '/login';
      } 
      
      // ⚠️ 403 (Forbidden): 권한이 없거나 데이터가 없는 경우
      // 기존에는 여기서 로그아웃을 시켰으나, 이제는 로그아웃 시키지 않고 에러만 기록합니다.
      else if (status === 403) {
        console.error("403 Forbidden: 접근 권한이 없거나 해당 데이터가 존재하지 않습니다.");
        // 여기서 로그아웃(window.location.href) 로직을 제거함으로써 무한 로그아웃을 방지합니다.
      }
    }
    return Promise.reject(error);
  }
);

export default api;