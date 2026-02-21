import axios from 'axios';

// 1. 주소 설정 (백엔드 서버 주소로 직접 지정)
// 주의: '/api'를 붙이지 마세요. 컴포넌트에서 '/api/...'를 쓰고 있기 때문입니다.
const BASE_URL = 'http://localhost:8080'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // GPT 분석 등 오래 걸리는 작업을 위해 타임아웃 넉넉하게 설정
  timeout: 60000, // 60초 (1분)
});

// 2. 요청 인터셉터 (갈 때: 토큰 자동 첨부)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 백엔드가 "Bearer " 형식을 원하므로 그대로 유지
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 응답 인터셉터 (올 때: 에러 감지 및 자동 로그아웃)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      // ★ 디버깅 팁: 개발 중에는 에러가 뭔지 봐야 하므로 콘솔에 찍어줍니다.
      console.error("API 에러 발생:", error.response.data);

      // 401(인증 실패) 또는 403(권한 없음) 에러가 뜨면 로그아웃 처리
      if (status === 401 || status === 403) {
        console.warn("세션이 만료되어 자동 로그아웃됩니다.");
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName'); 
        localStorage.removeItem('roadmapInputs');
        localStorage.removeItem('roadmapResult');
        localStorage.removeItem('recommendedActivities');

        // 알림을 띄워주고 이동하면 사용자가 더 잘 알 수 있습니다.
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;