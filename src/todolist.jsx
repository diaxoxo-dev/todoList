import React, { useState, useEffect, useRef } from "react";
import "./todolist.css";

/* 
[Todo 앱 만들기 - 단계별 가이드]

1단계: 필요한 라이브러리 import
- React: UI 라이브러리
- useState: 상태 관리
- useEffect: 사이드 이펙트 처리
*/

/* 
2단계: FilterButtons 컴포넌트 만들기
- 필터 옵션을 보여주는 버튼들을 렌더링
- props로 filter 상태와 setFilter 함수를 받음
*/
const FilterButtons = ({ filter, setFilter }) => {
    // 필터 옵션 정의
    const FILTER_OPTIONS = [
        { label: "전체", value: "all" },
        { label: "진행중", value: "active" },
        { label: "완료", value: "completed" }
    ];

    return (
        <div className="filter-section">
            {FILTER_OPTIONS.map(({ label, value }) => (
                <button 
                    key={value}
                    className={filter === value ? "active" : ""}
                    onClick={() => setFilter(value)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

/* 
3단계: TodoItem 컴포넌트 만들기
- 개별 할 일 항목을 렌더링
- props로 task 객체와 필요한 함수들을 받음
*/
const TodoItem = ({ 
    task, 
    index, 
    updateTask, 
    deleteTask, 
    moveTask 
}) => {
    return (
        <li className={`${task.completed ? "completed" : ""} ${task.selected ? "selected" : ""}`}>
            <input 
                type="checkbox" 
                checked={task.selected}
                onChange={() => updateTask(index, { selected: !task.selected })}
            />
            <span className="task-text">
                {task.text}
            </span>
            <div className="task-actions">
                <button 
                    className={`complete-btn ${task.completed ? "completed" : ""}`}
                    onClick={() => updateTask(index, { completed: !task.completed })}
                >
                    {task.completed ? "미완료" : "완료"}
                </button>
                <button 
                    className="move-btn"
                    onClick={() => moveTask(index, 'up')}
                >
                    Up
                </button>
                <button 
                    className="move-btn"
                    onClick={() => moveTask(index, 'down')}
                >
                    Down
                </button>
                <button 
                    className="delete-btn"
                    onClick={() => deleteTask(index)}
                >
                    Del
                </button>
            </div>
        </li>
    );
};

/* 
4단계: 메인 TodoList 컴포넌트 만들기
*/
function TodoList() {
    /* 
    4-1: 상태(State) 정의
    - tasks: 할 일 목록
    - newTask: 새로 입력되는 할 일
    - filter: 현재 필터 상태
    - isAllSelected: 전체 선택 상태
    - error: 에러 메시지
    - isDarkMode: 다크모드 상태
    */
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem('todos');
        return savedTasks ? JSON.parse(savedTasks) : [
            { text: "Eat Breakfast", completed: false, selected: false },
            { text: "walk the dog", completed: false, selected: false },
            { text: "learn react", completed: false, selected: false }
        ];
    });
    const [newTask, setNewTask] = useState("");
    const [filter, setFilter] = useState("all");
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [error, setError] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });
    const isAddingRef = useRef(false);

    /* 
    4-2: 로컬 스토리지 연동
    - tasks가 변경될 때마다 로컬 스토리지에 저장
    */
    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(tasks));
    }, [tasks]);

    // 다크모드 토글 함수
    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('darkMode', newMode);
            return newMode;
        });
    };

    // 다크모드 적용
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    /* 
    4-3: 입력값 검증 함수
    - 빈 입력 검사
    - 최대 길이 검사
    */
    const validateTask = (text) => {
        if (!text.trim()) {
            setError('할 일을 입력해주세요.');
            return false;
        }
        if (text.length > 100) {
            setError('할 일은 100자 이내로 입력해주세요.');
            return false;
        }
        setError(null);
        return true;
    };

    /* 
    4-4: 핵심 기능 함수들
    */
    // 할 일 추가
    const addTask = () => {
        if (isAddingRef.current) return;
        isAddingRef.current = true;

        const trimmedTask = newTask.trim();
        if (!validateTask(trimmedTask)) {
            isAddingRef.current = false;
            return;
        }
        
        setTasks(prevTasks => [...prevTasks, { 
            text: trimmedTask, 
            completed: false, 
            selected: false 
        }]);
        setNewTask("");
        
        // 다음 실행을 위해 플래그 초기화
        setTimeout(() => {
            isAddingRef.current = false;
        }, 100);
    };

    // 할 일 수정
    const updateTask = (index, updates) => {
        setTasks(prevTasks => 
            prevTasks.map((task, i) => 
                i === index ? { ...task, ...updates } : task
            )
        );
    };

    // 할 일 삭제
    const deleteTask = (index) => {
        setTasks(prevTasks => prevTasks.filter((_, i) => i !== index));
    };

    // 할 일 이동
    const moveTask = (index, direction) => {
        setTasks(prevTasks => {
            if (
                (direction === 'up' && index > 0) || 
                (direction === 'down' && index < prevTasks.length - 1)
            ) {
                const newTasks = [...prevTasks];
                const newIndex = direction === 'up' ? index - 1 : index + 1;
                [newTasks[index], newTasks[newIndex]] = [newTasks[newIndex], newTasks[index]];
                return newTasks;
            }
            return prevTasks;
        });
    };

    // 전체 선택/해제
    const toggleSelectAll = () => {
        setIsAllSelected(prev => !prev);
        setTasks(prevTasks => 
            prevTasks.map(task => ({ ...task, selected: !isAllSelected }))
        );
    };

    // 선택된 할 일 삭제
    const deleteSelectedTasks = () => {
        setTasks(prevTasks => prevTasks.filter(task => !task.selected));
    };

    // 완료된 할 일 삭제
    const deleteCompletedTasks = () => {
        setTasks(prevTasks => prevTasks.filter(task => !task.completed));
    };

    // 모든 할 일 삭제
    const deleteAllTasks = () => {
        if (window.confirm('모든 할 일을 삭제하시겠습니까?')) {
            setTasks([]);
        }
    };

    /* 
    4-5: 계산된 값들
    - 필터링된 할 일 목록
    - 남은 할 일 개수
    - 선택된 할 일 개수
    */
    const filteredTasks = tasks.filter(task => {
        switch (filter) {
            case "active": return !task.completed;
            case "completed": return task.completed;
            default: return true;
        }
    });

    const remainingCount = tasks.filter(task => !task.completed).length;
    const selectedCount = tasks.filter(task => task.selected).length;

    /* 
    4-6: UI 렌더링
    - 에러 메시지
    - 입력 영역
    - 필터 버튼
    - 통계
    - 일괄 작업 버튼
    - 할 일 목록
    */
    return (
        <div className="to-do-list">
            <button 
                className="theme-toggle" 
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            />
            <h1>To-Do List</h1>
            
            {error && <div className="error-message">{error}</div>}

            <div className="input-section">
                <input 
                    type="text" 
                    placeholder="새로운 할 일 추가" 
                    value={newTask} 
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            addTask();
                        }
                    }}
                />
                <button onClick={addTask}>추가</button>
            </div>

            <FilterButtons filter={filter} setFilter={setFilter} />

            <div className="stats">
                {remainingCount}개 남음 | {selectedCount}개 선택됨
            </div>

            <div className="bulk-actions">
                <button onClick={toggleSelectAll}>
                    {isAllSelected ? "전체 해제" : "전체 선택"}
                </button>
                <button onClick={deleteSelectedTasks}>선택 삭제</button>
                <button onClick={deleteCompletedTasks}>완료 삭제</button>
                <button onClick={deleteAllTasks}>전체 삭제</button>
            </div>

            <ol>
                {filteredTasks.map((task, index) => (
                    <TodoItem
                        key={index}
                        task={task}
                        index={index}
                        updateTask={updateTask}
                        deleteTask={deleteTask}
                        moveTask={moveTask}
                    />
                ))}
            </ol>
        </div>
    );
}

// 5단계: 컴포넌트 export
export default TodoList;


