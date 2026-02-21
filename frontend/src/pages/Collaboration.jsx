import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Collaboration = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedGroup]);

  const groups = [
    { id: 1, title: "알고리즘 스터디", desc: "자료구조 및 알고리즘", tags: ["알고리즘", "코딩테스트"], current: 4, max: 6 },
    { id: 2, title: "웹 개발 프로젝트팀", desc: "웹 프로그래밍", tags: ["React", "Node.js"], current: 3, max: 5 },
    { id: 3, title: "AI/ML 세미나", desc: "머신러닝", tags: ["머신러닝", "AI"], current: 5, max: 8 },
    { id: 4, title: "운영체제 스터디", desc: "운영체제", tags: ["운영체제", "시험대비"], current: 2, max: 4 }
  ];

  const messages = [
    { id: 1, sender: "김철수", text: "다음주 스터디 시간 언제가 좋을까요?", time: "10:30", isMe: false },
    { id: 2, sender: "이영희", text: "저는 수요일 오후 2시 괜찮습니다!", time: "10:32", isMe: true },
    { id: 3, sender: "박민수", text: "저도 수요일 괜찮아요. 장소는 도서관으로 할까요?", time: "10:35", isMe: false },
  ];

  const handleSend = () => {
    if(!chatInput.trim()) return;
    alert("메시지 전송 기능은 준비 중입니다!");
    setChatInput("");
  };

  return (
    <MainContent>
      <HeaderArea>
        <PageTitle>협업툴</PageTitle>
        <PageSubtitle>팀 프로젝트와 스터디를 효율적으로 관리하세요</PageSubtitle>
      </HeaderArea>

      <ContentGrid>
        <LeftColumn>
          <ListHeader>
            <TitleIcon>👥 스터디 그룹</TitleIcon>
            <AddButton>+</AddButton>
          </ListHeader>
          <SearchBar placeholder="🔍 그룹 검색..." />
          <GroupList>
            {groups.map((group) => (
              <GroupItem key={group.id} active={selectedGroup === group.id} onClick={() => setSelectedGroup(group.id)}>
                <GroupTop><GroupTitle>{group.title}</GroupTitle><MemberCount>{group.current}/{group.max}</MemberCount></GroupTop>
                <GroupDesc>{group.desc}</GroupDesc>
                <TagContainer>{group.tags.map((t, i) => <Tag key={i}>{t}</Tag>)}</TagContainer>
              </GroupItem>
            ))}
          </GroupList>
          <CreateGroupButton>새 그룹 만들기</CreateGroupButton>
        </LeftColumn>

        <RightColumn>
          {selectedGroup ? (
            <ChatLayout>
              <ChatHeader>
                <div>
                  <ChatTitle>{groups.find(g => g.id === selectedGroup).title}</ChatTitle>
                  <ChatSubtitle>{groups.find(g => g.id === selectedGroup).current}명 참여 중</ChatSubtitle>
                </div>
                <HeaderButtons><IconButton>📅 일정</IconButton><IconButton>📄 문서</IconButton></HeaderButtons>
              </ChatHeader>
              <ChatArea>
                {messages.map((msg) => (
                  <MessageRow key={msg.id} isMe={msg.isMe}>
                    {!msg.isMe && <MsgAvatar>{msg.sender[0]}</MsgAvatar>}
                    <div>
                      {!msg.isMe && <SenderName>{msg.sender} <Time>{msg.time}</Time></SenderName>}
                      <Bubble isMe={msg.isMe}>{msg.text}</Bubble>
                    </div>
                  </MessageRow>
                ))}
                <div ref={chatEndRef} />
              </ChatArea>
              <InputArea>
                <ChatInput value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="메시지 입력..." onKeyPress={(e)=>e.key==='Enter'&&handleSend()} />
                <SendButton onClick={handleSend}>🚀</SendButton>
              </InputArea>
              <AiSection>
                <AiHeader>🤖 AI 튜터링</AiHeader>
                <AiBox>
                  <AiBotRow>
                    <AiAvatar>🤖</AiAvatar>
                    <AiBubble>안녕하세요! AI 튜터입니다. 궁금한 점을 물어보세요.</AiBubble>
                  </AiBotRow>
                  <AiInputBox><input placeholder="질문 입력..." /><AiSendBtn>질문</AiSendBtn></AiInputBox>
                </AiBox>
              </AiSection>
            </ChatLayout>
          ) : (
            <EmptyState>
              <EmptyIcon>👥</EmptyIcon>
              <EmptyTitle>스터디 그룹을 선택하세요</EmptyTitle>
              <EmptyText>왼쪽 목록에서 선택하거나<br/>새로운 그룹을 만들어보세요</EmptyText>
            </EmptyState>
          )}
        </RightColumn>
      </ContentGrid>
    </MainContent>
  );
};

export default Collaboration;

// 스타일 컴포넌트
const MainContent = styled.div` flex: 1; padding: 40px; height: 100vh; overflow-y: hidden; box-sizing: border-box; display: flex; flex-direction: column; `;
const HeaderArea = styled.div` margin-bottom: 20px; flex-shrink: 0; `;
const PageTitle = styled.h2` font-size: 28px; color: #333; font-weight: bold; margin-bottom: 8px; `;
const PageSubtitle = styled.p` font-size: 16px; color: #666; `;
const ContentGrid = styled.div` display: flex; gap: 30px; flex: 1; overflow: hidden; `;
const LeftColumn = styled.div` width: 320px; display: flex; flex-direction: column; flex-shrink: 0; `;
const ListHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; `;
const TitleIcon = styled.h3` font-size: 18px; font-weight: bold; color: #6b21a8; `;
const AddButton = styled.button` width: 32px; height: 32px; background: #a855f7; color: white; border-radius: 8px; border: none; font-size: 20px; cursor: pointer; `;
const SearchBar = styled.input` width: 100%; padding: 12px; border: 1px solid #eee; border-radius: 10px; background: #f9fafb; margin-bottom: 20px; outline: none; box-sizing: border-box;`;
const GroupList = styled.div` flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 5px; `;
const GroupItem = styled.div` background: white; padding: 20px; border-radius: 12px; cursor: pointer; border: 1px solid ${props => props.active ? '#a855f7' : '#eee'}; box-shadow: ${props => props.active ? '0 4px 12px rgba(168, 85, 247, 0.15)' : 'none'}; transition: all 0.2s; &:hover { transform: translateY(-2px); } `;
const GroupTop = styled.div` display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; `;
const GroupTitle = styled.h4` font-weight: bold; font-size: 16px; color: #333; `;
const MemberCount = styled.span` font-size: 12px; color: #888; `;
const GroupDesc = styled.p` font-size: 13px; color: #666; margin-bottom: 12px; `;
const TagContainer = styled.div` display: flex; gap: 5px; flex-wrap: wrap; `;
const Tag = styled.span` background: #f3e8ff; color: #7e22ce; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; `;
const CreateGroupButton = styled.button` margin-top: 15px; width: 100%; padding: 14px; background: white; border: 1px solid #eee; border-radius: 10px; color: #666; font-weight: bold; cursor: pointer; &:hover { background: #f9fafb; } `;
const RightColumn = styled.div` flex: 1; background: white; border-radius: 20px; border: 1px solid #eee; display: flex; flex-direction: column; overflow: hidden; height: 100%; `;
const EmptyState = styled.div` flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: #aaa; `;
const EmptyIcon = styled.div` font-size: 60px; margin-bottom: 20px; opacity: 0.3; `;
const EmptyTitle = styled.h3` font-size: 20px; color: #333; margin-bottom: 10px; `;
const EmptyText = styled.p` font-size: 14px; line-height: 1.6; `;
const ChatLayout = styled.div` display: flex; flex-direction: column; height: 100%; `;
const ChatHeader = styled.div` padding: 20px 30px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: white; `;
const ChatTitle = styled.h3` font-size: 18px; font-weight: bold; margin-bottom: 4px; `;
const ChatSubtitle = styled.span` font-size: 13px; color: #888; `;
const HeaderButtons = styled.div` display: flex; gap: 10px; `;
const IconButton = styled.button` padding: 8px 12px; border: 1px solid #eee; background: white; border-radius: 8px; cursor: pointer; font-size: 13px; `;
const ChatArea = styled.div` flex: 1; padding: 30px; overflow-y: auto; background: #fafafa; display: flex; flex-direction: column; gap: 20px; `;
const MessageRow = styled.div` display: flex; gap: 10px; justify-content: ${props => props.isMe ? 'flex-end' : 'flex-start'}; `;
const MsgAvatar = styled.div` width: 36px; height: 36px; background: #c084fc; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 14px; `;
const SenderName = styled.div` font-size: 13px; color: #666; margin-bottom: 4px; display: flex; gap: 6px; align-items: center; `;
const Time = styled.span` font-size: 11px; color: #aaa; `;
const Bubble = styled.div` max-width: 300px; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; background: ${props => props.isMe ? '#a855f7' : 'white'}; color: ${props => props.isMe ? 'white' : '#333'}; border: ${props => props.isMe ? 'none' : '1px solid #eee'}; `;
const InputArea = styled.div` padding: 20px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; `;
const ChatInput = styled.input` flex: 1; padding: 12px 16px; border-radius: 20px; border: 1px solid #eee; outline: none; background: #f9fafb; `;
const SendButton = styled.button` width: 44px; height: 44px; border-radius: 50%; background: #a855f7; color: white; border: none; cursor: pointer; font-size: 18px; `;
const AiSection = styled.div` border-top: 5px solid #f3f4f6; padding: 20px; background: white; `;
const AiHeader = styled.h4` color: #6b21a8; font-weight: bold; font-size: 16px; margin-bottom: 15px; `;
const AiBox = styled.div` background: white; border-radius: 12px; `;
const AiBotRow = styled.div` display: flex; gap: 12px; margin-bottom: 15px; `;
const AiAvatar = styled.div` width: 36px; height: 36px; background: white; border: 1px solid #ddd; border-radius: 8px; font-size: 20px; display: flex; justify-content: center; align-items: center; `;
const AiBubble = styled.div` background: #fdf4ff; color: #6b21a8; padding: 12px; border-radius: 12px; font-size: 14px; flex: 1; `;
const AiInputBox = styled.div` display: flex; gap: 8px; input { flex: 1; padding: 10px; border: 1px solid #eee; border-radius: 8px; outline: none; } `;
const AiSendBtn = styled.button` padding: 0 16px; background: #d946ef; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; `;