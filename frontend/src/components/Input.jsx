// src/components/Input.jsx
import styled from 'styled-components';

const Input = ({ label, type = "text", placeholder, value, onChange, name }) => {
  return (
    <Wrapper>
      <Label>{label}</Label>
      <StyledInput 
        type={type} 
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
      />
    </Wrapper>
  );
};

export default Input;

const Wrapper = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px;
  background-color: #f3f4f6; /* 연한 회색 배경 */
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box; /* 패딩 포함 크기 계산 */

  &:focus {
    background-color: #fff;
    border-color: #a855f7; /* 포커스 시 보라색 테두리 */
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
  }

  &::placeholder {
    color: #aaa;
  }
`;