import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';

// 🚨 [진짜 완벽 해결] 화면을 흔들리게 만들던 악성 코드를 진짜로, 완전히 지웠습니다! 
// StudyNote와 토씨 하나 틀리지 않은 순수 GlobalStyle입니다.
const GlobalStyle = createGlobalStyle`
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d8b4fe; border-radius: 10px; }
`;

const fadeIn = keyframes` from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } `;
const slideUp = keyframes` from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } `;

const Collaboration = () => {
  const [activeTab, setActiveTab] = useState('CHAT'); 
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [chatInput, setChatInput] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); 
  
  const [form, setForm] = useState({ title: '', date: '', time: '', type: 'PROJECT', tags: '', link: '', notice: '' });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isDragging, setIsDragging] = useState(false);

  const [filterType, setFilterType] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('DESC');

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('collaboration_groups');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('collaboration_groups', JSON.stringify(groups));
  }, [groups]);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentGroup = groups.find(g => g.id === selectedGroupId);

  // 그룹이 선택되거나 탭이 'CHAT'일 때 맨 아래로 스크롤
  useEffect(() => {
    if (activeTab === 'CHAT' && currentGroup) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentGroup?.messages, activeTab]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const openModal = (type) => {
    setModalType(type);
    if (type === 'EDIT_NOTICE') {
      setForm({ ...form, notice: currentGroup?.notice || '' });
    } else {
      setForm({ title: '', date: '', time: '', type: 'PROJECT', tags: '', link: '', notice: '' });
    }
    setIsModalOpen(true);
  };

  const handleCopyInviteLink = () => {
    if (!currentGroup) return;
    const dummyLink = `https://capstone.app/invite/${currentGroup.id.toString(36)}`;
    navigator.clipboard.writeText(dummyLink).then(() => {
      showToast("🔗 팀원 초대 링크가 복사되었습니다!");
    }).catch(() => {
      showToast("링크 복사에 실패했습니다.");
    });
  };

  const handleDeleteGroup = (e, id, title) => {
    e.stopPropagation();
    if (window.confirm(`'${title}' 그룹을 정말 삭제하시겠습니까?\n모든 일정과 자료가 삭제됩니다.`)) {
      const filtered = groups.filter(g => g.id !== id);
      setGroups(filtered);
      if (selectedGroupId === id) {
        setSelectedGroupId(null);
      }
      showToast("그룹이 삭제되었습니다.");
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedGroupId) return;
    const newMessage = {
      id: Date.now(),
      sender: '나',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    updateGroupData('messages', newMessage);
    setChatInput('');
  };

  const handleSubmit = () => {
    if (modalType === 'CREATE_GROUP' && !form.title) return alert("제목을 입력해주세요.");

    if (modalType === 'CREATE_GROUP') {
      const newGroup = {
        id: Date.now(),
        title: form.title,
        type: form.type, 
        members: 1,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        messages: [{ id: Date.now(), sender: '시스템', text: `'${form.title}' 공간이 생성되었습니다. 팀원들을 초대해보세요!`, time: '방금', type: 'system' }],
        schedules: [],
        documents: [],
        notice: '팀원들에게 필요한 공지사항을 작성해주세요.' 
      };
      setGroups([...groups, newGroup]);
      setSelectedGroupId(newGroup.id);
      showToast("새 공간이 생성되었습니다!");
    } else if (selectedGroupId) {
      if (modalType === 'ADD_SCHEDULE') {
        if (!form.date) return alert("날짜를 선택해주세요.");
        const newSchedule = {
          id: Date.now(),
          title: form.title,
          date: form.date,
          time: form.time || '종일',
          dday: Math.ceil((new Date(form.date) - new Date()) / (1000 * 60 * 60 * 24))
        };
        updateGroupData('schedules', newSchedule);
        showToast("일정이 등록되었습니다.");
      } else if (modalType === 'ADD_DOC') {
        const newDoc = {
          id: Date.now(),
          title: form.title,
          uploader: '나',
          date: new Date().toISOString().split('T')[0],
          type: 'link',
          link: form.link
        };
        updateGroupData('documents', newDoc);
        showToast("링크가 추가되었습니다.");
      } else if (modalType === 'EDIT_NOTICE') {
        // 🔥 [기능 추가] 공지사항을 등록하면 채팅방에 알림 띄우기
        const newNoticeMsg = {
          id: Date.now(),
          sender: '시스템',
          text: `📢 [공지사항 업데이트]\n${form.notice}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'system'
        };

        setGroups(groups.map(g => g.id === selectedGroupId ? { 
          ...g, 
          notice: form.notice,
          messages: [...g.messages, newNoticeMsg] 
        } : g));
        
        showToast("공지사항이 등록되어 채팅방에 공유되었습니다.");
      }
    }
    setIsModalOpen(false);
  };

  const updateGroupData = (key, newItem) => {
    setGroups(groups.map(g => g.id === selectedGroupId ? { ...g, [key]: [...g[key], newItem] } : g));
  };

  const uploadFiles = (files) => {
    if (files.length === 0 || !selectedGroupId) return;
    const newDocs = files.map(file => ({
      id: Date.now() + Math.random(),
      title: file.name,
      uploader: '나',
      date: new Date().toISOString().split('T')[0],
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: 'file'
    }));
    setGroups(groups.map(g => g.id === selectedGroupId ? { ...g, documents: [...g.documents, ...newDocs] } : g));
    showToast(`${files.length}개의 파일 업로드 완료!`);
  };

  const processedGroups = groups
    .filter(g => filterType === 'ALL' || g.type === filterType)
    .sort((a, b) => {
      if (sortOrder === 'DESC') return b.id - a.id;
      if (sortOrder === 'ASC') return a.id - b.id;
      if (sortOrder === 'NAME') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <>
      <GlobalStyle />
      {/* 💡 학습노트의 Container & InnerWrap 코드를 그대로 사용 */}
      <Container>
        <InnerWrap>
          {/* 사이드바 */}
          <Sidebar>
            <LogoArea>👥 협업툴</LogoArea>
            <SidebarControls>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="ALL">전체 보기</option>
                <option value="PROJECT">프로젝트</option>
                <option value="STUDY">스터디</option>
              </select>
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="DESC">최신순</option>
                <option value="ASC">오래된순</option>
                <option value="NAME">이름순</option>
              </select>
            </SidebarControls>
            
            <Divider />
            
            <SidebarHeaderRow>
              <div className="title">MY GROUPS</div>
              <button className="add-btn" onClick={() => openModal('CREATE_GROUP')} title="새 프로젝트 생성">+</button>
            </SidebarHeaderRow>
            
            <GroupList>
              {processedGroups.length > 0 ? processedGroups.map(g => (
                <GroupItem key={g.id} $active={g.id === selectedGroupId} onClick={() => setSelectedGroupId(g.id)}>
                  <div className="item-content">
                    <div className="group-info">
                      <div className="group-name">{g.title}</div>
                      <div className="group-meta">
                        <Badge>{g.type === 'PROJECT' ? '프로젝트' : '스터디'}</Badge>
                        {g.tags && g.tags.length > 0 && (
                          <span className="tags-text">{g.tags.slice(0, 2).map(t => `#${t}`).join(' ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="delete-btn" onClick={(e) => handleDeleteGroup(e, g.id, g.title)}>✖</button>
                </GroupItem>
              )) : <EmptyGroupGuide>조건에 맞는 그룹이 없습니다.</EmptyGroupGuide>}
            </GroupList>
          </Sidebar>

          {/* 메인 콘텐츠 영역 */}
          <MainContent>
            {currentGroup ? (
              <>
                <TopBar>
                  <TopControlRow>
                    <BackBtn onClick={() => setSelectedGroupId(null)}>← 메인 화면으로</BackBtn>
                  </TopControlRow>
                  
                  <div className="header-text">
                    <Badge className="big-badge">{currentGroup.type === 'PROJECT' ? '🚀 프로젝트' : '📚 스터디'}</Badge>
                    <h1>{currentGroup.title}</h1>
                  </div>
                  
                  {/* 🔥 [요청사항 반영] 4개의 탭으로 완벽하게 분리했습니다! */}
                  <Tabs>
                    {['CHAT', 'SCHEDULE', 'DOC', 'INFO'].map(tab => (
                      <Tab key={tab} $active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                        {tab === 'CHAT' ? '💬 팀 채팅' : tab === 'SCHEDULE' ? '📅 타임라인' : tab === 'DOC' ? '📂 자료실' : 'ℹ️ 팀 정보'}
                      </Tab>
                    ))}
                  </Tabs>
                </TopBar>

                <ContentWrapper>
                  {/* 1. 팀 채팅 탭 */}
                  {activeTab === 'CHAT' && (
                    <ChatContainer>
                      <MessageList>
                        {currentGroup.messages.map(m => (
                          m.type === 'system' ? <SystemMessage key={m.id}>{m.text}</SystemMessage> :
                          <MessageRow key={m.id} $isMe={m.isMe}>
                            <div className="bubble">
                              {!m.isMe && <div className="name">{m.sender}</div>}
                              <div className="text">{m.text}</div>
                              <div className="time">{m.time}</div>
                            </div>
                          </MessageRow>
                        ))}
                        <div ref={chatEndRef} />
                      </MessageList>
                      <InputArea>
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="메시지를 입력하세요..." />
                        <button onClick={handleSendMessage}>전송</button>
                      </InputArea>
                    </ChatContainer>
                  )}

                  {/* 2. 타임라인 탭 */}
                  {activeTab === 'SCHEDULE' && (
                    <ScrollContainer>
                      <ActionHeader>
                        <div className="title-area">
                          <h3>프로젝트 타임라인</h3>
                          <p>앞으로 다가올 중요한 일정을 관리하세요.</p>
                        </div>
                        <button onClick={() => openModal('ADD_SCHEDULE')}>+ 일정 추가</button>
                      </ActionHeader>
                      {currentGroup.schedules.length > 0 ? (
                        <GridContainer>
                          {currentGroup.schedules.map(s => (
                            <ScheduleCard key={s.id}>
                              <div className={`d-day ${s.dday <= 3 ? 'urgent' : ''}`}>D-{s.dday}</div>
                              <h4>{s.title}</h4>
                              <p>📅 {s.date} <br/> ⏰ {s.time}</p>
                            </ScheduleCard>
                          ))}
                        </GridContainer>
                      ) : (
                        <EmptyStateBox>
                          <div className="icon">📆</div>
                          <h4>등록된 일정이 없습니다</h4>
                          <p>팀원들과 공유할 중요한 미팅이나 데드라인을 추가해보세요.</p>
                          <button onClick={() => openModal('ADD_SCHEDULE')}>일정 등록하기</button>
                        </EmptyStateBox>
                      )}
                    </ScrollContainer>
                  )}

                  {/* 3. 자료실 탭 */}
                  {activeTab === 'DOC' && (
                    <ScrollContainer>
                      <ActionHeader>
                        <div className="title-area">
                          <h3>공유 자료실</h3>
                          <p>프로젝트 관련 문서와 링크를 모아보세요.</p>
                        </div>
                        <button onClick={() => openModal('ADD_DOC')}>+ 링크 추가</button>
                      </ActionHeader>
                      <DropZone 
                        $isDragging={isDragging}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={e => { e.preventDefault(); setIsDragging(false); uploadFiles(Array.from(e.dataTransfer.files)); }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <input type="file" multiple ref={fileInputRef} style={{display:'none'}} onChange={e => uploadFiles(Array.from(e.target.files))} />
                        <div className="icon">☁️</div>
                        <h4>여기를 클릭하거나 파일을 드래그하세요</h4>
                        <p>PDF, 이미지, 문서 파일 지원 (최대 50MB)</p>
                      </DropZone>
                      <DocList>
                        {currentGroup.documents.length > 0 ? currentGroup.documents.map(d => (
                          <DocItem key={d.id}>
                            <div className="doc-icon">{d.type === 'file' ? '📄' : '🔗'}</div>
                            <div className="doc-content">
                              <a href={d.link || '#'} target="_blank" rel="noreferrer">{d.title}</a>
                              <span>{d.uploader} • {d.date} {d.size && `(${d.size})`}</span>
                            </div>
                          </DocItem>
                        )) : <div style={{textAlign:'center', padding:'40px', color:'#94a3b8'}}>업로드된 자료가 없습니다.</div>}
                      </DocList>
                    </ScrollContainer>
                  )}

                  {/* 🔥 4. 새롭게 분리된 [팀 정보] 탭 (타임라인 제외, 공지 및 멤버) */}
                  {activeTab === 'INFO' && (
                    <ScrollContainer>
                      <ActionHeader>
                        <div className="title-area">
                          <h3>팀 정보</h3>
                          <p>우리 팀의 공지사항과 멤버를 확인하고 관리하세요.</p>
                        </div>
                      </ActionHeader>
                      
                      <InfoGrid>
                        <PanelSection>
                          <NoticeHeader>
                            <h4>📢 팀 공지사항</h4>
                            <button className="edit-btn" onClick={() => openModal('EDIT_NOTICE')}>수정하기</button>
                          </NoticeHeader>
                          <NoticeBox>
                            {currentGroup.notice}
                          </NoticeBox>
                        </PanelSection>
                        
                        <PanelSection>
                          <h4>👥 참여 멤버 ({currentGroup.members})</h4>
                          <MemberRow>
                            <div className="avatar me">나</div>
                            <div className="name">나 (팀장)</div>
                            <div className="role">Online</div>
                          </MemberRow>
                          <InviteBtn onClick={handleCopyInviteLink}>+ 팀원 초대 링크 복사</InviteBtn>
                        </PanelSection>
                      </InfoGrid>
                    </ScrollContainer>
                  )}
                </ContentWrapper>
              </>
            ) : (
              <WelcomeScreen>
                <div className="hero">
                  <div className="emoji">🚀</div>
                  <h2>새로운 협업을 시작하세요</h2>
                  <p>팀원들과 소통하고, 일정을 관리하며, 자료를 안전하게 공유하세요.</p>
                  <div className="action-cards">
                    <div className="action-card" onClick={() => openModal('CREATE_GROUP')}>
                      <div className="card-icon">📁</div>
                      <h3>새 공간 만들기</h3>
                      <p>새 프로젝트나 스터디 그룹을<br/>생성하세요.</p>
                    </div>
                    <div className="action-card dummy">
                      <div className="card-icon">🤝</div>
                      <h3>초대 코드로 참여</h3>
                      <p>팀장에게 받은 코드를<br/>입력하여 합류하세요.</p>
                    </div>
                  </div>
                </div>
              </WelcomeScreen>
            )}
          </MainContent>
        </InnerWrap>
      </Container>

      {/* 기본 입력 폼 모달들 */}
      {isModalOpen && (
        <Overlay onClick={() => setIsModalOpen(false)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <h2>
              {modalType === 'CREATE_GROUP' && '✨ 새 공간 만들기'}
              {modalType === 'ADD_SCHEDULE' && '📅 일정 등록'}
              {modalType === 'ADD_DOC' && '🔗 링크 공유'}
              {modalType === 'EDIT_NOTICE' && '📢 공지사항 작성'}
            </h2>
            
            {modalType !== 'EDIT_NOTICE' && (
              <InputGroup>
                <label>제목</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="입력하세요" />
              </InputGroup>
            )}
            
            {modalType === 'CREATE_GROUP' && (
              <>
                <InputGroup>
                  <label>유형</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="PROJECT">프로젝트</option>
                    <option value="STUDY">스터디</option>
                  </select>
                </InputGroup>
                <InputGroup>
                  <label>관련 태그 (선택)</label>
                  <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="React, Spring (쉼표로 구분)" />
                </InputGroup>
              </>
            )}
            
            {modalType === 'ADD_SCHEDULE' && (
              <Row>
                <InputGroup style={{flex: 1}}><label>날짜</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></InputGroup>
                <InputGroup style={{flex: 1}}><label>시간</label><input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} /></InputGroup>
              </Row>
            )}
            
            {modalType === 'ADD_DOC' && (
              <InputGroup><label>URL 주소</label><input value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://..." /></InputGroup>
            )}
            
            {modalType === 'EDIT_NOTICE' && (
              <InputGroup>
                <label>공지사항 내용</label>
                <textarea value={form.notice} onChange={e => setForm({...form, notice: e.target.value})} placeholder="팀원들에게 알릴 내용을 입력하세요..." />
              </InputGroup>
            )}
            
            <BtnGroup>
              <button className="cancel" onClick={() => setIsModalOpen(false)}>취소</button>
              <button className="confirm" onClick={handleSubmit}>저장하기</button>
            </BtnGroup>
          </ModalBox>
        </Overlay>
      )}
      <ToastContainer $show={toast.show} $type={toast.type}>{toast.message}</ToastContainer>
    </>
  );
};

export default Collaboration;

// --- 💅 Styled Components ---

/* 🔥 [학습 노트 원본과 100% 동일 복사] 절대 흔들리지 않는 레이아웃 */
const Container = styled.div` flex: 1; padding: 40px; overflow-y: hidden; height: 100vh; box-sizing: border-box; background-color: #f8f9fc; display: flex; justify-content: center; `;
const InnerWrap = styled.div` display: flex; width: 100%; max-width: 1200px; gap: 30px; height: 100%; `;

const Sidebar = styled.div` width: 320px; background: white; border-radius: 20px; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eee; display: flex; flex-direction: column; flex-shrink: 0; `;
const LogoArea = styled.div` font-size: 18px; font-weight: 800; margin-bottom: 25px; color: #333; text-align: left; `;

const SidebarControls = styled.div`
  display: flex; gap: 8px; margin-bottom: 20px;
  select { width: 100%; padding: 10px 14px; background: #f8f9fa; color: #555; border: 1px solid #eee; border-radius: 10px; font-size: 13px; font-weight: bold; outline: none; cursor: pointer; transition: border-color 0.2s; &:focus { border-color: #a855f7; } }
`;

const Divider = styled.hr` border: 0; height: 1px; background: #f0f0f0; margin: 10px 0 20px 0; width: 100%; `;

const SidebarHeaderRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 5px; flex-shrink: 0;
  .title { font-size: 13px; font-weight: 800; color: #888; }
  .add-btn { background: #fdf4ff; color: #a855f7; border: 1px solid #f0abfc; width: 28px; height: 28px; border-radius: 8px; display: flex; justify-content: center; align-items: center; cursor: pointer; font-size: 18px; font-weight: bold; transition: 0.2s; &:hover { background: #a855f7; color: white; } }
`;

const GroupList = styled.div` flex: 1; overflow-y: auto; padding-right: 5px; &::-webkit-scrollbar { width: 6px; } &::-webkit-scrollbar-thumb { background: #e9d5ff; border-radius: 4px; } `;
const GroupItem = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 15px; border-radius: 12px; cursor: pointer; margin-bottom: 10px; transition: transform 0.2s;
  background: ${props => props.$active ? '#fdf4ff' : 'white'}; border: 1px solid ${props => props.$active ? '#f0abfc' : '#eee'};
  &:hover { transform: translateY(-2px); box-shadow: 0 2px 10px rgba(168,85,247,0.1); .delete-btn { opacity: 1; } }
  .item-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
  .group-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
  .group-name { font-weight: bold; font-size: 14px; color: #333; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .group-meta { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #888; }
  .tags-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #94a3b8; font-weight: 500;}
  .delete-btn { opacity: 0; background: none; border: none; font-size: 14px; color: #aaa; cursor: pointer; padding: 0 5px; transition: 0.2s; &:hover { color: #ef4444; } }
`;
const Badge = styled.span` font-size: 11px; color: #9333ea; background: #f3e8ff; padding: 4px 8px; border-radius: 6px; font-weight: bold; display: inline-block; flex-shrink: 0;`;
const EmptyGroupGuide = styled.div` text-align: center; color: #aaa; font-size: 13px; margin-top: 30px; `;

const MainContent = styled.div` flex: 1; background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eee; display: flex; flex-direction: column; position: relative; overflow: hidden; `;

const TopBar = styled.div`
  width: 100%; padding: 40px 50px 0 50px; background: white; border-bottom: 1px solid #f8f9fa; flex-shrink: 0; 
  .header-text { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 20px; h1 { margin: 0 0 10px 0; font-size: 26px; font-weight: 800; color: #333; } .big-badge { margin-bottom: 12px; } }
`;

const TopControlRow = styled.div` display: flex; align-items: center; margin-bottom: 20px; `;

const BackBtn = styled.button`
  background: white; border: 1px solid #eee; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 13px; color: #666; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 5px;
  &:hover { background: #f8f9fa; color: #333; border-color: #ddd; }
`;

const Tabs = styled.div` display: flex; gap: 25px; padding-bottom: 15px; overflow-x: auto; &::-webkit-scrollbar { display: none; } `;
const Tab = styled.button` background: none; border: none; padding: 10px 4px; font-size: 15px; font-weight: bold; color: ${props => props.$active ? '#a855f7' : '#888'}; cursor: pointer; border-bottom: 3px solid ${props => props.$active ? '#a855f7' : 'transparent'}; transition: 0.2s; &:hover { color: #a855f7; } white-space: nowrap; `;

const ContentWrapper = styled.div` width: 100%; flex: 1; display: flex; flex-direction: column; background: white; overflow: hidden; `;

const ChatContainer = styled.div` display: flex; flex-direction: column; flex: 1; overflow: hidden; background: #fdfcff; `;
const MessageList = styled.div` flex: 1; overflow-y: auto; padding: 30px 40px; display: flex; flex-direction: column; gap: 15px; &::-webkit-scrollbar { width: 8px; } &::-webkit-scrollbar-thumb { background: #e9d5ff; border-radius: 4px; } `;
const SystemMessage = styled.div` align-self: center; background: #fdf4ff; border: 1px solid #f0abfc; padding: 10px 20px; border-radius: 30px; font-size: 12px; color: #a855f7; font-weight: bold; margin: 10px 0; text-align: center; white-space: pre-wrap; line-height: 1.5; `;
const MessageRow = styled.div`
  display: flex; justify-content: ${props => props.$isMe ? 'flex-end' : 'flex-start'}; animation: ${fadeIn} 0.3s;
  .bubble { max-width: 75%; padding: 15px 20px; border-radius: 16px; background: ${props => props.$isMe ? '#a855f7' : '#f8f9fa'}; color: ${props => props.$isMe ? 'white' : '#333'}; font-size: 14px; line-height: 1.5; box-shadow: 0 2px 5px rgba(0,0,0,0.02); word-break: break-word; }
  .name { font-size: 12px; font-weight: bold; margin-bottom: 6px; color: #888; }
  .time { font-size: 11px; opacity: 0.7; margin-top: 8px; text-align: right; }
`;
const InputArea = styled.div`
  padding: 20px 40px 30px 40px; background: white; border-top: 1px solid #f0f0f0; display: flex; gap: 12px; flex-shrink: 0; 
  input { flex: 1; padding: 14px 20px; border: 1px solid #ddd; border-radius: 12px; font-size: 14px; background: #f8f9fa; outline: none; transition: 0.2s; &:focus { background: white; border-color: #a855f7; } }
  button { padding: 0 30px; background: #a855f7; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.2s; flex-shrink: 0; &:hover { background: #9333ea; } }
`;

const ScrollContainer = styled.div` flex: 1; padding: 40px 50px 100px 50px; overflow-y: auto; &::-webkit-scrollbar { width: 8px; } &::-webkit-scrollbar-thumb { background: #d8b4fe; border-radius: 4px; } `;
const ActionHeader = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; gap: 15px;
  .title-area h3 { margin: 0 0 8px 0; color: #333; font-size: 20px; font-weight: 800; }
  .title-area p { margin: 0; color: #888; font-size: 14px; }
  button { background: #a855f7; color: white; padding: 10px 20px; border-radius: 10px; border: none; font-size: 14px; font-weight: bold; cursor: pointer; transition: 0.2s; flex-shrink: 0; &:hover { background: #9333ea; transform: translateY(-2px); } }
`;
const GridContainer = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; `; 
const ScheduleCard = styled.div`
  background: white; padding: 25px; border-radius: 16px; border: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: 0.2s; &:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(168,85,247,0.1); border-color: #d8b4fe; }
  .d-day { display: inline-block; padding: 6px 12px; border-radius: 6px; background: #f0fdf4; color: #166534; font-size: 12px; font-weight: 800; margin-bottom: 15px; border: 1px solid #bbf7d0; }
  .d-day.urgent { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
  h4 { margin: 0 0 10px 0; font-size: 16px; color: #333; font-weight: bold; word-break: break-word; } p { margin: 0; font-size: 13px; color: #666; line-height: 1.6; }
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.$isDragging ? '#a855f7' : '#ddd'}; background: ${props => props.$isDragging ? '#fdf4ff' : '#f8f9fa'};
  border-radius: 16px; padding: 60px 20px; text-align: center; cursor: pointer; margin-bottom: 30px; transition: 0.2s; &:hover{ border-color: #a855f7; background: #fdf4ff; }
  .icon { font-size: 40px; margin-bottom: 15px; }
  h4 { margin: 0 0 10px 0; font-size: 16px; color: #333; font-weight: bold; } p { margin: 0; color: #888; font-size: 13px; }
`;
const DocList = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; `;
const DocItem = styled.div`
  display: flex; gap: 15px; align-items: center; padding: 20px; background: white; border-radius: 12px; border: 1px solid #eee; transition: 0.2s; &:hover{ border-color:#d8b4fe; box-shadow: 0 4px 12px rgba(168,85,247,0.05);}
  .doc-icon { font-size: 24px; background: #f8f9fa; padding: 10px; border-radius: 10px; flex-shrink: 0; } .doc-content { display: flex; flex-direction: column; overflow: hidden; }
  a { font-size: 15px; font-weight: bold; color: #333; text-decoration: none; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; &:hover { color: #a855f7; text-decoration: underline; } } span { font-size: 12px; color: #888; }
`;
const EmptyStateBox = styled.div` text-align: center; padding: 80px 20px; background: #f8f9fa; border-radius: 16px; border: 1px dashed #ddd; .icon { font-size: 40px; margin-bottom: 20px; } h4 { font-size: 18px; margin: 0 0 10px 0; color: #333; } p { color: #888; margin: 0 0 25px 0; font-size: 14px; word-break: keep-all; } button { background: white; color: #a855f7; border: 1px solid #a855f7; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; &:hover { background: #fdf4ff; } } `;

const WelcomeScreen = styled.div`
  flex: 1; display: flex; align-items: center; justify-content: center; background: white; overflow-y: auto; padding: 20px;
  .hero { text-align: center; max-width: 600px; animation: ${fadeIn} 0.5s ease-out; }
  .emoji { font-size: 60px; margin-bottom: 20px; }
  h2 { font-size: 28px; font-weight: 800; color: #333; margin-bottom: 15px; }
  p { font-size: 15px; color: #666; line-height: 1.6; margin-bottom: 40px; }
  .action-cards { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
  .action-card { background: white; padding: 30px; border-radius: 16px; flex: 1; min-width: 200px; max-width: 260px; text-align: left; cursor: pointer; border: 1px solid #eee; box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: 0.3s; &:hover { transform: translateY(-5px); border-color: #a855f7; box-shadow: 0 10px 25px rgba(168, 85, 247, 0.1); } }
  .action-card.dummy { opacity: 0.6; cursor: not-allowed; &:hover { transform: none; border-color: #eee; box-shadow: none; } }
  .card-icon { font-size: 32px; margin-bottom: 15px; }
  h3 { margin: 0 0 10px 0; font-size: 17px; color: #333; }
  .action-card p { font-size: 13px; color: #888; margin: 0; line-height: 1.5; }
`;

/* 🔥 4번째 팀 정보 탭을 위한 스타일 */
const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px; 
`;
const PanelSection = styled.div` 
  h4 { font-size: 16px; color: #333; margin-bottom: 15px; font-weight: 800; } 
`;
const NoticeHeader = styled.div` 
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; 
  h4 { margin: 0; } 
  .edit-btn { background: #fdf4ff; color: #a855f7; border: 1px solid #f0abfc; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer; transition: 0.2s; &:hover { background: #f3e8ff; } } 
`;
const NoticeBox = styled.div` 
  background: #fdf4ff; padding: 25px; border-radius: 16px; font-size: 14px; color: #444; line-height: 1.7; border: 1px solid #f0abfc; white-space: pre-wrap;
  .pin { display: inline-block; background: #f0abfc; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-bottom: 15px; } 
`;
const MemberRow = styled.div`
  display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border: 1px solid #eee; border-radius: 12px; transition: 0.2s;
  .avatar { width: 45px; height: 45px; background: #f3e8ff; color: #a855f7; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; }
  .name { font-size: 15px; font-weight: bold; flex: 1; color: #333; } 
  .role { font-size: 12px; color: #166534; font-weight: bold; background: #f0fdf4; padding: 6px 10px; border-radius: 6px; border: 1px solid #bbf7d0; }
`;
const InviteBtn = styled.button` 
  width: 100%; padding: 16px; background: white; border: 2px dashed #d8b4fe; border-radius: 12px; color: #a855f7; font-weight: bold; font-size: 14px; cursor: pointer; margin-top: 10px; transition: 0.2s; 
  &:hover { background: #fdf4ff; border-style: solid; } 
`;

const Overlay = styled.div` position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(4px); `;
const ModalBox = styled.div` background: white; padding: 40px; border-radius: 20px; width: 550px; max-width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.1); h2 { margin: 0 0 25px 0; color: #333; font-size: 22px; font-weight: 800;} `;
const InputGroup = styled.div` margin-bottom: 20px; label { display: block; font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #555; } input, select, textarea { width: 100%; padding: 14px; border: 1px solid #ddd; border-radius: 10px; font-size: 14px; outline: none; transition: 0.2s; box-sizing: border-box; &:focus { border-color: #a855f7; } } textarea { height: 150px; resize: none; line-height: 1.6; font-family: inherit; } `;
const BtnGroup = styled.div` display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; button { padding: 12px 24px; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.2s; } .cancel { background: #f8f9fa; color: #555; border: 1px solid #ddd; &:hover { background: #eee; } } .confirm { background: #a855f7; color: white; border: none; &:hover { background: #9333ea; } } `;
const Row = styled.div` display: flex; gap: 15px; `;

const ToastContainer = styled.div` position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 14px 28px; border-radius: 30px; font-size: 14px; font-weight: bold; display: ${props => props.$show ? 'block' : 'none'}; animation: ${slideUp} 0.3s ease-out; z-index: 10000; box-shadow: 0 10px 20px rgba(0,0,0,0.1); `;