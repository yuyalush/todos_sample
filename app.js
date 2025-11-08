// ToDoアプリのメインクラス
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.editingId = null;
        this.draggedElement = null;
        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    // DOM要素の初期化
    initializeElements() {
        this.addTodoHeader = document.getElementById('addTodoHeader');
        this.addTodoForm = document.getElementById('addTodoForm');
        this.editTodoForm = document.getElementById('editTodoForm');
        this.todoInput = document.getElementById('todoInput');
        this.editInput = document.getElementById('editInput');
        this.addBtn = document.getElementById('addBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.todoList = document.getElementById('todoList');
    }

    // イベントリスナーの設定
    attachEventListeners() {
        // ヘッダークリックで追加フォーム表示
        this.addTodoHeader.addEventListener('click', () => this.showAddForm());
        
        // 追加ボタン
        this.addBtn.addEventListener('click', () => this.addTodo());
        
        // キャンセルボタン
        this.cancelBtn.addEventListener('click', () => this.hideAddForm());
        
        // 保存ボタン
        this.saveBtn.addEventListener('click', () => this.saveEdit());
        
        // 編集キャンセルボタン
        this.cancelEditBtn.addEventListener('click', () => this.hideEditForm());
        
        // Enterキーで追加
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        // Enterキーで保存
        this.editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveEdit();
        });
    }

    // LocalStorageからToDoを読み込む
    loadTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }

    // LocalStorageにToDoを保存
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // 追加フォームを表示
    showAddForm() {
        this.addTodoForm.style.display = 'block';
        this.todoInput.value = '';
        this.todoInput.focus();
    }

    // 追加フォームを非表示
    hideAddForm() {
        this.addTodoForm.style.display = 'none';
        this.todoInput.value = '';
    }

    // ToDoを追加
    addTodo() {
        const content = this.todoInput.value.trim();
        if (!content) return;

        const newTodo = {
            id: Date.now(),
            content: content,
            completed: false
        };

        this.todos.push(newTodo);
        this.saveTodos();
        this.hideAddForm();
        this.render();
    }

    // 編集フォームを表示
    showEditForm(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.editingId = id;
        this.editInput.value = todo.content;
        this.editTodoForm.style.display = 'block';
        this.editInput.focus();
    }

    // 編集フォームを非表示
    hideEditForm() {
        this.editTodoForm.style.display = 'none';
        this.editInput.value = '';
        this.editingId = null;
    }

    // 編集を保存
    saveEdit() {
        const content = this.editInput.value.trim();
        if (!content) return;

        const todo = this.todos.find(t => t.id === this.editingId);
        if (todo) {
            todo.content = content;
            this.saveTodos();
            this.hideEditForm();
            this.render();
        }
    }

    // ToDoの完了状態を切り替え
    toggleComplete(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    // ToDoを削除
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }

    // ドラッグ開始
    handleDragStart(e, id) {
        this.draggedElement = e.currentTarget;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.setData('draggedId', id);
    }

    // ドラッグ終了
    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
        // すべてのdrag-overクラスを削除
        document.querySelectorAll('.todo-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    }

    // ドラッグオーバー
    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    // ドラッグエンター
    handleDragEnter(e) {
        e.currentTarget.classList.add('drag-over');
    }

    // ドラッグリーブ
    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    // ドロップ
    handleDrop(e, dropIndex) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();

        const draggedIndex = parseInt(e.dataTransfer.getData('draggedIndex'), 10);
        
        if (draggedIndex !== dropIndex) {
            const draggedItem = this.todos[draggedIndex];
            this.todos.splice(draggedIndex, 1);
            
            // ドロップ位置を調整
            const newIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
            this.todos.splice(newIndex, 0, draggedItem);
            
            this.saveTodos();
            this.render();
        }

        return false;
    }

    // リストを描画
    render() {
        this.todoList.innerHTML = '';

        if (this.todos.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'ToDoは何もありません！';
            this.todoList.appendChild(emptyMessage);
            return;
        }

        this.todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = 'todo-item' + (todo.completed ? ' completed' : '');
            li.draggable = true;

            // ドラッグイベントの設定
            li.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
            li.addEventListener('dragend', (e) => this.handleDragEnd(e));
            li.addEventListener('dragover', (e) => this.handleDragOver(e));
            li.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            li.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            li.addEventListener('drop', (e) => this.handleDrop(e, index));

            // チェックボックス
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => this.toggleComplete(todo.id));

            // コンテンツ
            const content = document.createElement('span');
            content.className = 'todo-content';
            content.textContent = todo.content;

            // アクションボタン
            const actions = document.createElement('div');
            actions.className = 'todo-actions';

            // 編集ボタン
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn edit-btn';
            editBtn.innerHTML = '✏️';
            editBtn.title = '編集';
            editBtn.addEventListener('click', () => this.showEditForm(todo.id));

            // 削除ボタン
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = '削除';
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            li.appendChild(checkbox);
            li.appendChild(content);
            li.appendChild(actions);

            this.todoList.appendChild(li);
        });
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
