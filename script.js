// script.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('프로필 페이지 스크립트가 로드되었습니다.');

    // PRD 4.4: 방문자 통계 (링크별 클릭 수) - 기초적인 클라이언트 측 로그
    // 실제 통계 수집은 백엔드 연동이 필요합니다.
    const links = document.querySelectorAll('.link-item');
    links.forEach(link => {
        link.addEventListener('click', () => {
            const linkTitle = link.querySelector('.link-title')?.textContent || link.textContent || '알 수 없는 링크';
            // 실제로는 이 데이터를 서버로 전송하여 집계해야 합니다.
            console.log(`링크 클릭: "${linkTitle}" (URL: ${link.href})`);
        });
    });

    // ====== 프로필 정보 로드 및 저장 ======
    const profileName = document.getElementById('profileName');
    const profileBio = document.getElementById('profileBio');
    const profilePicture = document.getElementById('profilePicture');
    const profilePicInput = document.getElementById('profilePicInput');
    const profileBgUrl = document.getElementById('profileBgUrl');
    const profileMainContainer = document.querySelector('.profile-main-container');

    function loadProfile() {
        const data = JSON.parse(localStorage.getItem('profileData') || '{}');
        if (data.name) profileName.value = data.name;
        if (data.bio) profileBio.value = data.bio;
        if (data.picture) profilePicture.src = data.picture;
        if (data.bgUrl) profileBgUrl.value = data.bgUrl;
        if (data.bgUrl && profileMainContainer) profileMainContainer.style.backgroundImage = `url('${data.bgUrl}')`;
    }
    function saveProfile() {
        const data = {
            name: profileName.value,
            bio: profileBio.value,
            picture: profilePicture.src,
            bgUrl: profileBgUrl.value
        };
        localStorage.setItem('profileData', JSON.stringify(data));
        if (profileMainContainer) profileMainContainer.style.backgroundImage = data.bgUrl ? `url('${data.bgUrl}')` : '';
    }
    profileName.addEventListener('input', saveProfile);
    profileBio.addEventListener('input', saveProfile);
    profileBgUrl.addEventListener('input', saveProfile);
    profilePicInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                profilePicture.src = evt.target.result;
                saveProfile();
            };
            reader.readAsDataURL(file);
        }
    });
    loadProfile();

    // ====== 테마/폰트/색상 커스터마이징 ======
    const themeSelect = document.getElementById('themeSelect');
    const fontSelect = document.getElementById('fontSelect');
    const colorSelect = document.getElementById('colorSelect');
    function applyTheme() {
        document.body.className = '';
        document.body.classList.add(`theme-${themeSelect.value}`);
        document.body.style.fontFamily = fontSelect.value;
        document.documentElement.style.setProperty('--point-color', colorSelect.value);
        localStorage.setItem('profileTheme', JSON.stringify({theme: themeSelect.value, font: fontSelect.value, color: colorSelect.value}));
    }
    function loadTheme() {
        const t = JSON.parse(localStorage.getItem('profileTheme') || '{}');
        if (t.theme) themeSelect.value = t.theme;
        if (t.font) fontSelect.value = t.font;
        if (t.color) colorSelect.value = t.color;
        applyTheme();
    }
    themeSelect.addEventListener('change', applyTheme);
    fontSelect.addEventListener('change', applyTheme);
    colorSelect.addEventListener('input', applyTheme);
    loadTheme();

    // ====== 링크 추가/삭제/순서변경/활성화 ======
    const linksList = document.getElementById('linksList');
    const addLinkBtn = document.getElementById('addLinkBtn');
    function getLinks() {
        return JSON.parse(localStorage.getItem('profileLinks') || '[]');
    }
    function saveLinks(links) {
        localStorage.setItem('profileLinks', JSON.stringify(links));
    }
    function renderLinks() {
        const links = getLinks();
        linksList.innerHTML = '';
        links.forEach((link, idx) => {
            const li = document.createElement('li');
            li.className = 'link-item';
            li.style.opacity = link.active === false ? 0.5 : 1;
            li.innerHTML = `
                <input type="text" class="link-title" value="${link.title}" placeholder="제목">
                <input type="text" class="link-url" value="${link.url}" placeholder="URL">
                <input type="text" class="link-desc" value="${link.desc || ''}" placeholder="설명(선택)">
                <button class="move-up">▲</button>
                <button class="move-down">▼</button>
                <button class="toggle-active">${link.active === false ? '비활성' : '활성'}</button>
                <button class="delete-link">삭제</button>
            `;
            // 클릭 이벤트(통계)
            li.querySelector('.link-url').addEventListener('change', e => {
                links[idx].url = e.target.value;
                saveLinks(links);
            });
            li.querySelector('.link-title').addEventListener('change', e => {
                links[idx].title = e.target.value;
                saveLinks(links);
            });
            li.querySelector('.link-desc').addEventListener('change', e => {
                links[idx].desc = e.target.value;
                saveLinks(links);
            });
            li.querySelector('.move-up').addEventListener('click', () => {
                if (idx > 0) {
                    [links[idx-1], links[idx]] = [links[idx], links[idx-1]];
                    saveLinks(links);
                    renderLinks();
                }
            });
            li.querySelector('.move-down').addEventListener('click', () => {
                if (idx < links.length-1) {
                    [links[idx+1], links[idx]] = [links[idx], links[idx+1]];
                    saveLinks(links);
                    renderLinks();
                }
            });
            li.querySelector('.toggle-active').addEventListener('click', () => {
                links[idx].active = !links[idx].active;
                saveLinks(links);
                renderLinks();
            });
            li.querySelector('.delete-link').addEventListener('click', () => {
                links.splice(idx, 1);
                saveLinks(links);
                renderLinks();
            });
            // 실제 링크 클릭(통계)
            li.addEventListener('click', e => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
                if (link.active === false) return;
                window.open(link.url, '_blank');
                incrementClickCount();
                incrementLinkClick(idx);
            });
            linksList.appendChild(li);
        });
    }
    addLinkBtn.addEventListener('click', () => {
        const links = getLinks();
        links.push({title: '', url: '', desc: '', active: true});
        saveLinks(links);
        renderLinks();
    });
    renderLinks();

    // ====== 방문자/클릭 통계 ======
    const visitorCount = document.getElementById('visitorCount');
    const clickCount = document.getElementById('clickCount');
    function incrementVisitorCount() {
        let count = parseInt(localStorage.getItem('visitorCount') || '0', 10);
        count++;
        localStorage.setItem('visitorCount', count);
        visitorCount.textContent = count;
    }
    function incrementClickCount() {
        let count = parseInt(localStorage.getItem('clickCount') || '0', 10);
        count++;
        localStorage.setItem('clickCount', count);
        clickCount.textContent = count;
    }
    function incrementLinkClick(idx) {
        const links = getLinks();
        links[idx].clicks = (links[idx].clicks || 0) + 1;
        saveLinks(links);
    }
    function loadStats() {
        visitorCount.textContent = localStorage.getItem('visitorCount') || '0';
        clickCount.textContent = localStorage.getItem('clickCount') || '0';
    }
    loadStats();
    incrementVisitorCount();

    // ====== QR코드 다운로드 ======
    const qrImg = document.getElementById('qrImg');
    const downloadQrBtn = document.getElementById('downloadQrBtn');
    downloadQrBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = qrImg.src;
        a.download = 'profile-qr.png';
        a.click();
    });

    // ====== 미리보기 모드 ======
    const previewBtn = document.getElementById('previewBtn');
    previewBtn.addEventListener('click', () => {
        alert('미리보기 모드는 실제 배포 환경에서 확인 가능합니다.');
    });

    // ====== 간단 회원가입/로그인 ======
    const authForm = document.getElementById('authForm');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    function setAuthUI(loggedIn) {
        if (loggedIn) {
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
            logoutBtn.style.display = '';
        } else {
            loginBtn.style.display = '';
            signupBtn.style.display = '';
            logoutBtn.style.display = 'none';
        }
    }
    function isLoggedIn() {
        return !!localStorage.getItem('authUser');
    }
    setAuthUI(isLoggedIn());
    authForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = authEmail.value;
        const pw = authPassword.value;
        const user = JSON.parse(localStorage.getItem('user_' + email) || 'null');
        if (user && user.pw === pw) {
            localStorage.setItem('authUser', email);
            setAuthUI(true);
            alert('로그인 성공!');
        } else {
            alert('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
    });
    signupBtn.addEventListener('click', () => {
        const email = authEmail.value;
        const pw = authPassword.value;
        if (!email || !pw) return alert('이메일과 비밀번호를 입력하세요.');
        if (localStorage.getItem('user_' + email)) return alert('이미 가입된 이메일입니다.');
        localStorage.setItem('user_' + email, JSON.stringify({pw}));
        alert('회원가입 성공! 이제 로그인하세요.');
    });
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authUser');
        setAuthUI(false);
        alert('로그아웃 되었습니다.');
    });
});
