import React, { useState, useEffect } from "react";
import "./todolist.css";

// 필터 옵션 컴포넌트
const FilterButtons = ({ filter, setFilter }) => {
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

// 할 일 항목 컴포넌트
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

function TodoList() {
    // 상태 관리
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

    // tasks가 변경될 때마다 로컬 스토리지에 저장
    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(tasks));
    }, [tasks]);

    // 입력값 검증
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

    // 할 일 추가
    const addTask = () => {
        if (!validateTask(newTask)) return;
        
        setTasks(prevTasks => [...prevTasks, { 
            text: newTask, 
            completed: false, 
            selected: false 
        }]);
        setNewTask("");
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

    // 필터링된 할 일 목록
    const filteredTasks = tasks.filter(task => {
        switch (filter) {
            case "active": return !task.completed;
            case "completed": return task.completed;
            default: return true;
        }
    });

    // 통계 계산
    const remainingCount = tasks.filter(task => !task.completed).length;
    const selectedCount = tasks.filter(task => task.selected).length;

    return (
        <div className="to-do-list">
            <h1>To-Do List</h1>
            
            {error && <div className="error-message">{error}</div>}

            <div className="input-section">
                <input 
                    type="text" 
                    placeholder="새로운 할 일 추가" 
                    value={newTask} 
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
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

export default TodoList;


