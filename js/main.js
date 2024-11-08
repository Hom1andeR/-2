let eventBus = new Vue();

Vue.component('list_with_tasks', {
    props: {
        list: {
            type: Object,
            required: true,
        },
        indexOfList: {
            type: Number,
            required: true,
        },
        column_id: {
            type: String,
            required: true,
        },
        beDisabled: {
            type: Boolean,
            required: true,
        },
        block: {
            type: Boolean,
            required: true,
        }
    },
    data() {
        return {
            countInSecond: 0,
        }
    },
    template: `
        <div class="list">
            <h3>{{list.title}}</h3>
            <p v-if="list.tasks.task1.name"><input type="checkbox" :disabled="beDisabled || block || list.tasks.task1.activity" v-model="list.tasks.task1.activity" @click="checkboxClick">{{list.tasks.task1.name}}</p>
            <p v-if="list.tasks.task2.name"><input type="checkbox" :disabled="beDisabled || block || list.tasks.task2.activity" v-model="list.tasks.task2.activity" @click="checkboxClick">{{list.tasks.task2.name}}</p>
            <p v-if="list.tasks.task3.name"><input type="checkbox" :disabled="beDisabled || block || list.tasks.task3.activity" v-model="list.tasks.task3.activity" @click="checkboxClick">{{list.tasks.task3.name}}</p>
            <p v-if="list.tasks.task4.name"><input type="checkbox" :disabled="beDisabled || block || list.tasks.task4.activity" v-model="list.tasks.task4.activity" @click="checkboxClick">{{list.tasks.task4.name}}</p>
            <p v-if="list.tasks.task5.name"><input type="checkbox" :disabled="beDisabled || block || list.tasks.task5.activity" v-model="list.tasks.task5.activity" @click="checkboxClick">{{list.tasks.task5.name}}</p>
            <p v-if="list.dateOfFinish">{{list.dateOfFinish}}</p>
        </div>
    `,
    methods: {
        checkboxClick() {


            setTimeout(() => {
                let overalCountTasks = 0;
                let activeCheckboxes = 0;
                for (let i in this.list.tasks) {
                    if (this.list.tasks[i].name) {
                        overalCountTasks++;
                        if (this.list.tasks[i].activity) {
                            activeCheckboxes++;
                        }
                    }
                }

                let copy = Object.assign({}, this.list);
                copy.tasks = Object.assign({}, this.list.tasks);
                for (let i in this.list.tasks) {
                    copy.tasks[i] = Object.assign({}, this.list.tasks[i]);
                }

                if (overalCountTasks / activeCheckboxes == 1) {
                    if (this.column_id == 'second') {
                        eventBus.$emit('move-me-to-third', copy);
                        eventBus.$emit('delete-me-from-second', this.indexOfList);
                    }

                } else if (overalCountTasks / activeCheckboxes <= 2) {
                    if (this.column_id == 'first') {

                        if (this.countInSecond < 5) {
                            eventBus.$emit('move-me-to-second', copy);
                            eventBus.$emit('delete-me-from-first', this.indexOfList);

                        }
                    }
                }
            }, 100);
        }
    },
    mounted() {

    }
})

Vue.component('column', {
    props: {
        column_name: {
            type: String,
            required: true,
        },
        column_id: {
            type: String,
            required: true,
        }

    },
    data() {
        return {
            listsArray: localStorage[this.column_id] ? JSON.parse(localStorage[this.column_id]) : [],
            beDisabled: false,
            firstColumnBlock: false,
        }
    },
    template: `
        <div class="column">
            <p>{{column_name}}</p>
            <div  v-if="listsArray" v-for="(list, index) in listsArray">
                <list_with_tasks :block="firstColumnBlock" :list="list" :indexOfList="index" :column_id="column_id" :beDisabled="beDisabled"></list_with_tasks>
            </div>
        </div>
    `,
    mounted() {
        eventBus.$on('takeFromForm', function (copy) {
            if (this.column_id == 'first') {
                this.listsArray.push(copy);

                let arrayForStorrage = this.listsArray.slice();
                eventBus.$emit('saveMeInStorage', this.column_id, arrayForStorrage)


            }
        }.bind(this)),

            eventBus.$on('say-me-count-first', function () {
                if (this.column_id == 'first') {
                    let len = this.listsArray.length;
                    eventBus.$emit('say-me-count-first-resp', len);
                }
            }.bind(this))


        eventBus.$on('move-me-to-second', function (copy) {
            if (this.column_id == 'second') {
                if (this.listsArray.length < 5) {
                    this.listsArray.push(copy);
                    eventBus.$emit('say-me-count-first');
                } else {
                    eventBus.$emit('block-first-col');
                }
                let arrayForStorrage = this.listsArray.slice();
                eventBus.$emit('saveMeInStorage', this.column_id, arrayForStorrage)

            }
        }.bind(this)),

            eventBus.$on('block-first-col', function () {
                if (this.column_id == 'first') {
                    this.firstColumnBlock = true;

                }

            }.bind(this))

        eventBus.$on('delete-me-from-first', function (index) {
            if (this.column_id == 'first') {
                if (!this.firstColumnBlock) {
                    this.listsArray.splice(index, 1);
                }
                let arrayForStorrage = this.listsArray.slice();
                eventBus.$emit('saveMeInStorage', this.column_id, arrayForStorrage)
            }
        }.bind(this)),

            eventBus.$on('delete-me-from-second', function (index) {

                if (this.column_id == 'second') {
                    this.listsArray.splice(index, 1);

                    let arrayForStorrage = this.listsArray.slice();
                    eventBus.$emit('saveMeInStorage', this.column_id, arrayForStorrage)
                }
            }.bind(this))

        eventBus.$on('move-me-to-third', function (copy) {
            if (this.column_id == 'third') {
                const formatter = new Intl.DateTimeFormat('ru-RU',{ //Локалиизация русского формата 
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                });
                copy.dateOfFinish=formatter.format(new Date());
                this.beDisabled = true;
                this.listsArray.push(copy);
                eventBus.$emit('unblock-first-col');
                eventBus.$emit('scan-first-col');

                let arrayForStorrage = this.listsArray.slice();
                eventBus.$emit('saveMeInStorage', this.column_id, arrayForStorrage)
            }
        }.bind(this)),

            eventBus.$on('scan-first-col', () => {
                setTimeout(() => {
                    if(this.column_id == 'first') {
                        let index = 0;
                        for(let i of this.listsArray) {
                            let over = 0;
                            let act = 0;
                            for (let taskKey in i.tasks) {
                                let task = i.tasks[taskKey];
                                if (task.activity == true) {
                                    act++;
                                }
                                if (task.name != null) {
                                    over++;
                                }
                            }

                            if ((over / act) >= 1.5 && (over / act) <= 2) {
                                let copy = Object.assign({}, this.listsArray[index]);
                                copy.tasks = Object.assign({}, this.listsArray[index].tasks);
                                for(key in copy.tasks){
                                    copy.tasks[key] = Object.assign({}, this.listsArray[index].tasks[key]);
                                }
                                eventBus.$emit('just-push-in-second', copy);
                                eventBus.$emit('just-del-in-first', index);
                            }
                            index++;
                        }
                    }
                }, 100)
            })

        eventBus.$on('just-push-in-second', (copy)=>{
            if(this.column_id =='second'){
                this.listsArray.push(copy);
                let arrayForStorrage = this.listsArray.slice();
                eventBus.$emit('saveMeInStorage', this.column_id, arrayForStorrage)
            }
        })

        eventBus.$on('just-del-in-first', (index)=>{
            if(this.column_id == 'first'){
                this.listsArray.splice(index, 1);
                let arrayForStorrage = this.listsArray.slice();
                eventBus.$emit('saveMeInStorage', this.column_id, arrayForStorrage)
                eventBus.$emit('unblock-form-please');

            }
        })

        eventBus.$on('unblock-first-col', function () {
            if (this.column_id == 'first') {
                if (this.firstColumnBlock) {
                    this.firstColumnBlock = false;
                }
            }
        }.bind(this))

        eventBus.$on('yes-no-block-form',()=>{
            if(this.column_id == 'first'){
                setTimeout(()=>{
                    if(this.listsArray.length == 3){
                        eventBus.$emit('block-form-please');
                    }else{
                        eventBus.$emit('unblock-form-please');
                    }
                }, 100)
            }


        })

    },
})

Vue.component('modal', {
template: `
<div class="modal-overlay">
<div class="modal-content">
<span class="close" @click="$emit('close')">&times;</span>
<slot></slot> <!— Слот для вставки формы —>
</div>
</div>
`,
});


Vue.component('creator', {
    template: `
<form @submit.prevent="customSubmit">
<div v-if="errors.length" class="error-messages">
<p v-for="er in errors" class="red-text">{{ er }}</p>
</div>
<p><b>Заголовок:</b> <input type="text" v-model="blank.title"></p>
<p>Задача - 1: <input type="text" v-model="blank.tasks.task1.name"></p>
<p>Задача - 2: <input type="text" v-model="blank.tasks.task2.name"></p>
<p>Задача - 3: <input type="text" v-model="blank.tasks.task3.name"></p>
<p v-if="!hiddenFlag4">Задача - 4: <input type="text" v-model="blank.tasks.task4.name"></p>
<p v-if="!hiddenFlag5">Задача - 5: <input type="text" v-model="blank.tasks.task5.name"></p>
<button v-if="hiddenFlag5" @click.prevent="addTask">+++</button>
<button type="submit">Добавить</button>
</form>
`,
    data() {
        return {
            hiddenFlag4: true,
            hiddenFlag5: true,
            errors: [],
            blank: {
                title: null,
                tasks: {
                    task1: { name: null, activity: false },
                    task2: { name: null, activity: false },
                    task3: { name: null, activity: false },
                    task4: { name: null, activity: false },
                    task5: { name: null, activity: false },
                }
            }
        };
    },
    methods: {
        addTask() {
            if (this.hiddenFlag4) {
                this.hiddenFlag4 = false;
            } else {
                this.hiddenFlag5 = false;
            }
        },
        customSubmit() {
            this.errors = [];
            if (!this.blank.title) {
                this.errors.push('Заголовок обязателен.');
            }
            let validTasks = Object.values(this.blank.tasks).filter(task => task.name).length;
            if (validTasks < 3) {
                this.errors.push('Три задачи обязательны к заполнению.');
            }
            if (!this.errors.length) {
                let copy = JSON.parse(JSON.stringify(this.blank));
                this.$emit('submit-card', copy); // Отправляем данные в основное приложение
                this.resetForm();
            }
        },
        resetForm() {
            this.blank = {
                title: null,
                tasks: {
                    task1: { name: null, activity: false },
                    task2: { name: null, activity: false },
                    task3: { name: null, activity: false },
                    task4: { name: null, activity: false },
                    task5: { name: null, activity: false },
                }
            };
            this.hiddenFlag4 = true;
            this.hiddenFlag5 = true;
        }
    }
});

new Vue({
    el: '#app',
    data: {
        showModal: false // Управляет видимостью модального окна
    },
    methods: {
        openModal() {
            this.showModal = true; // Открываем модальное окно
        },
        closeModal() {
            this.showModal = false; // Закрываем модальное окно
        },
        addCard(card) {
            eventBus.$emit('takeFromForm', card); // Передаем данные из формы
            this.closeModal(); // Закрываем модальное окно после добавления карточки
        }
    }
});

