// 애플리케이션의 상태와 로직을 관리하는 객체
const libraryMapApp = {
    // DOM 요소
    nodes: {},
    // 데이터
    state: {
        libraryData: [],
        mapData: [],
        drawableLibraries: [], // Canvas에 그릴 좌표 정보 포함
        hoveredLibraryIdx: null,
        selectedLibraryIdx: 0,
    },

    // 상수 (Magic Number 제거)
    CONSTANTS: {
        MAP_MIN_X: 126,
        MAP_MAX_X: 127,
        MAP_MIN_MAX_Y: 35,
        X_OFFSET: -1000,
        Y_OFFSET: 800,
        Y_MULTIPLIER: 2,
        POINT_RADIUS: 10,
    },

    // 초기화 함수
    async init() {
        this.cacheDOM();
        this.setCanvasSize();
        await this.fetchData();
        this.calculateDrawPositions();
        this.renderBuildingList();
        this.renderMap();
        this.renderLibraryMenu(this.state.libraryData[this.state.selectedLibraryIdx]);
        this.bindEvents();
    },

    // 사용할 DOM 요소를 미리 찾아 저장
    cacheDOM() {
        this.nodes.canvas = document.querySelector("#canvas");
        this.nodes.ctx = this.nodes.canvas.getContext("2d");
        this.nodes.buildingList = document.querySelector(".building");
        this.nodes.popup = document.querySelector(".showabout");
        this.nodes.menu = document.querySelector(".menu");
        this.nodes.booksContainer = document.querySelector(".books");
        this.nodes.searchInput = document.querySelector("input");
        this.nodes.searchBtn = document.querySelector("button");
        this.nodes.closeBtn = document.querySelector(".close");
    },

    setCanvasSize() {
        this.nodes.canvas.width = 1920;
        this.nodes.canvas.height = 1080;
    },

    // 데이터 한 번만 fetching
    async fetchData() {
        try {
            const res = await fetch("./find_library.json");
            const data = await res.json();
            this.state.mapData = data.map;
            this.state.libraryData = data.libraries;
        } catch (error) {
            console.error("데이터를 불러오는 데 실패했습니다:", error);
        }
    },
    
    // Canvas에 그릴 좌표를 미리 계산하여 저장
    calculateDrawPositions() {
        const { canvas } = this.nodes;
        const { MAP_MIN_X, MAP_MAX_X, MAP_MIN_MAX_Y, X_OFFSET, Y_OFFSET, Y_MULTIPLIER } = this.CONSTANTS;

        this.state.drawableLibraries = this.state.libraryData.map(lib => {
            const x = Math.floor(((lib.longitude - MAP_MIN_X) * canvas.width) / (MAP_MAX_X - MAP_MIN_X)) + X_OFFSET;
            const y = Math.floor((MAP_MIN_MAX_Y - lib.latitude) * canvas.height * Y_MULTIPLIER) + Y_OFFSET;
            const path = new Path2D();
            path.arc(x, y, this.CONSTANTS.POINT_RADIUS, 0, Math.PI * 2);
            return { ...lib, x, y, path };
        });
    },

    // 이벤트 리스너 등록
    bindEvents() {
        // Event Delegation 적용
        this.nodes.buildingList.addEventListener("mouseover", this.handleBuildingMouseOver.bind(this));
        this.nodes.buildingList.addEventListener("mouseleave", this.handleBuildingMouseLeave.bind(this));
        this.nodes.buildingList.addEventListener("click", this.handleBuildingClick.bind(this));
        
        this.nodes.canvas.addEventListener("mousemove", this.handleCanvasMouseMove.bind(this));
        this.nodes.canvas.addEventListener("click", this.handleCanvasClick.bind(this));

        this.nodes.searchBtn.addEventListener("click", this.handleSearch.bind(this));

        // Event Delegation 적용
        this.nodes.booksContainer.addEventListener("click", this.handleBookClick.bind(this));
        
        this.nodes.closeBtn.addEventListener("click", () => this.nodes.menu.style.display = "none");
    },
    
    // 전체 다시 그리기
    render() {
        this.renderMap();
        this.renderLibraryPoints();
    },

    // 지도 경계선 그리기
    renderMap() {
        const { ctx, canvas } = this.nodes;
        const { MAP_MIN_X, MAP_MAX_X, MAP_MIN_MAX_Y, X_OFFSET, Y_OFFSET, Y_MULTIPLIER } = this.CONSTANTS;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        this.state.mapData.forEach(([lon, lat], i) => {
            const x = Math.floor(((lon - MAP_MIN_X) * canvas.width) / (MAP_MAX_X - MAP_MIN_X)) + X_OFFSET;
            const y = Math.floor((MAP_MIN_MAX_Y - lat) * canvas.height * Y_MULTIPLIER) + Y_OFFSET;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        
        ctx.stroke();
        ctx.closePath();
    },

    // 도서관 위치 포인트 그리기
    renderLibraryPoints() {
        const { ctx } = this.nodes;
        this.state.drawableLibraries.forEach(lib => {
            ctx.fillStyle = lib.idx === this.state.hoveredLibraryIdx ? "red" : "black";
            ctx.fill(lib.path);
        });
    },

    // 왼쪽 건물 목록 렌더링
    renderBuildingList(libraries = this.state.libraryData) {
        // innerHTML을 반복적으로 사용하지 않고, 한 번에 문자열을 만들어 삽입 (성능 개선)
        this.nodes.buildingList.innerHTML = libraries
            .map(lib => `<div data-id="${lib.idx}">${lib.name}</div>`)
            .join("");
    },
    
    // 도서관 상세 메뉴 렌더링
    renderLibraryMenu(library) {
        if (!library) return;
        
        this.state.selectedLibraryIdx = library.idx;
        this.nodes.menu.style.display = "block";
        
        const aboutSection = this.nodes.menu.querySelector('.about');
        aboutSection.querySelector("img").src = `../images/find/${library.image}`;
        aboutSection.querySelector(".name").textContent = library.name;
        aboutSection.querySelector(".text").textContent = library.introduction;

        this.renderBooks(library.books);
    },

    // 책 목록 렌더링
    renderBooks(books, selectedBookId = null) {
        // 정렬 로직 분리
        const sortedBooks = [...books].sort((a, b) => {
            if (selectedBookId !== null) {
                // 선택된 책을 맨 앞으로
                return (b.idx === selectedBookId) - (a.idx === selectedBookId);
            }
            return 0; // 기본 정렬 없음
        });

        this.nodes.booksContainer.innerHTML = sortedBooks.map(item => `
            <div class="img-cover ${item.idx === selectedBookId ? 'select' : ''}" data-cate="${item.cate}" data-idx="${item.idx}">
                <img src="../images/find/${item.image}" alt="${item.name}" />
                <div class="img-content">
                    <div class="title">제목: <span class="setTitle">${item.name}</span></div>
                    <div class="publisher">출판일: <span class="setPublisher">${item.date}</span></div>
                    <div class="cate">카테고리: <span class="setCate">${item.cate}</span></div>
                    <div class="author">작가: <span class="setAuthor">${item.author}</span></div>
                </div>
            </div>
        `).join('');
    },
    
    // 팝업 정보 업데이트 및 표시/숨김
    updatePopup(library) {
        if (library) {
            const rect = this.nodes.canvas.getBoundingClientRect();
            const bestBooks = [...library.books].sort((a, b) => b.rating - a.rating).slice(0, 3);
            
            this.nodes.popup.innerHTML = `
                <h1>${library.name}</h1>
                <div class="showContainer">
                    <img src="../images/find/${library.image}" />
                    <div class="about">
                        <div class="text">${library.introduction}</div>
                        <div class="imgs">
                            ${bestBooks.map(book => `<img src="../images/find/${book.image}" />`).join('')}
                        </div>
                    </div>
                </div>
            `;
            this.nodes.popup.style.display = "block";
            this.nodes.popup.style.left = `${library.x + rect.left + 15}px`;
            this.nodes.popup.style.top = `${library.y + rect.top - this.nodes.popup.offsetHeight / 2}px`;
        } else {
            this.nodes.popup.style.display = "none";
        }
    },

    // --- 이벤트 핸들러 ---
    handleBuildingMouseOver(e) {
        if (!e.target.matches('.building div')) return;
        
        const libraryId = parseInt(e.target.dataset.id, 10);
        this.state.hoveredLibraryIdx = libraryId;
        
        // 모든 div의 배경색 초기화 후 현재 대상만 변경
        this.nodes.buildingList.querySelectorAll('div').forEach(div => div.style.backgroundColor = 'white');
        e.target.style.backgroundColor = 'red';

        const hoveredLibrary = this.state.drawableLibraries.find(lib => lib.idx === libraryId);
        this.updatePopup(hoveredLibrary);
        this.render();
    },

    handleBuildingMouseLeave() {
        this.state.hoveredLibraryIdx = null;
        this.nodes.buildingList.querySelectorAll('div').forEach(div => div.style.backgroundColor = 'white');
        this.updatePopup(null);
        this.render();
    },

    handleBuildingClick(e) {
        if (!e.target.matches('.building div')) return;

        const libraryId = parseInt(e.target.dataset.id, 10);
        const library = this.state.libraryData.find(lib => lib.idx === libraryId);
        this.renderLibraryMenu(library);
    },

    handleCanvasMouseMove(e) {
        const rect = this.nodes.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const hoveredLibrary = this.state.drawableLibraries.find(lib => 
            this.nodes.ctx.isPointInPath(lib.path, mouseX, mouseY)
        );

        const newHoverIdx = hoveredLibrary ? hoveredLibrary.idx : null;

        if (newHoverIdx !== this.state.hoveredLibraryIdx) {
            this.state.hoveredLibraryIdx = newHoverIdx;
            this.updatePopup(hoveredLibrary);
            this.render();
        }
    },

    handleCanvasClick(e) {
        const rect = this.nodes.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const clickedLibrary = this.state.drawableLibraries.find(lib =>
            this.nodes.ctx.isPointInPath(lib.path, mouseX, mouseY)
        );

        if (clickedLibrary) {
            this.renderLibraryMenu(clickedLibrary);
        }
    },
    
    handleBookClick(e) {
        const bookElement = e.target.closest(".img-cover");
        if (!bookElement) return;

        const selectedBookId = parseInt(bookElement.dataset.idx, 10);
        const selectedBookCate = bookElement.dataset.cate;
        const currentLibrary = this.state.libraryData.find(lib => lib.idx === this.state.selectedLibraryIdx);
        
        if (bookElement.classList.contains("select")) {
            // 이미 선택된 책을 다시 클릭하면 필터 해제
            this.renderBooks(currentLibrary.books);
        } else {
            // 다른 책을 클릭하면 해당 카테고리로 필터링하고 선택된 책을 맨 위로
            const filteredBooks = currentLibrary.books.filter(book => book.cate === selectedBookCate);
            this.renderBooks(filteredBooks, selectedBookId);
        }
    },
    
    handleSearch() {
        const searchTerm = this.nodes.searchInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            this.renderBuildingList(this.state.libraryData);
            return;
        }

        const filteredLibraries = this.state.libraryData.filter(library => {
            const libraryNameMatch = library.name.toLowerCase().includes(searchTerm);
            const bookNameMatch = library.books.some(book => book.name.toLowerCase().includes(searchTerm));
            return libraryNameMatch || bookNameMatch;
        });

        this.renderBuildingList(filteredLibraries);
        // 검색 결과에 따른 도서 목록도 업데이트 할 수 있습니다 (선택적)
    }
};

// 애플리케이션 시작
libraryMapApp.init();