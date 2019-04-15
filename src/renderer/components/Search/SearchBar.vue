<template>
    <div class="div-hor holder">
        <svg class="search-icon" @click="focus" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="13.563 66.209 15.018 15.018" width="15.018" height="15.018">
            <path d=" M 19.105 77.099 C 20.086 77.798 21.286 78.209 22.581 78.209 C 25.893 78.209 28.581 75.521 28.581 72.209 C 28.581 68.898 25.893 66.209 22.581 66.209 C 19.27 66.209 16.581 68.898 16.581 72.209 L 16.581 72.209 C 16.581 73.504 16.992 74.704 17.691 75.685 L 13.873 79.504 C 13.469 79.907 13.459 80.551 13.849 80.942 L 13.849 80.942 C 14.239 81.332 14.883 81.321 15.287 80.918 L 19.105 77.099 Z  M 18.381 72.209 C 18.381 69.891 20.263 68.009 22.581 68.009 C 24.899 68.009 26.781 69.891 26.781 72.209 C 26.781 74.527 24.899 76.409 22.581 76.409 C 20.263 76.409 18.381 74.527 18.381 72.209 L 18.381 72.209 Z " fill-rule="evenodd" />
        </svg>

        <input id="search-input" :placeholder="'Search ' + currentCriteria[0].toUpperCase()+currentCriteria.slice(1)" @input="mutateST" @click="highlight" @keyup.esc="blur" @keydown.enter.prevent="blur" @keydown.8="deletePrevText"/>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import { Id } from './../../utils/htmlQuery'

    export default {
        name: 'search',
        data() {
            return {
                cahedPool: null
            }
        },
        mounted() {
            this.cachedPool = this.filteredPool
        },
        watch: {
            currentCriteria: function () {
                this.cachedPool = this.filteredPool
            },
            currentTarget: function () {
                this.cachedPool = this.filtreredPool
            },
            filteredPool: function () {
                if (Id('search-input') != document.activeElement) {
                    this.cachedPool = this.filteredPool
                }
            }
        },
        methods: {
            ...mapActions([
                'updateSearchText',
                'updatePool',
                'lockHotKeys',
                'unlockHotKeys'
            ]),
            highlight() {
                Id('search-input').select()
                this.lockHotKeys('backspace')
            },
            blur() {
                Id('search-input').blur()
                this.unlockHotKeys('backspace')
            },
            focus() {
                Id('search-input').focus()
                this.highlight()
            },
            mutateST() {
                this.updateSearchText(event.target.value)
                this.updatePool(this.searchTracks())
            },
            searchTracks() {
                return this.cachedPool.filter((track) => {
                        return track.title.toLowerCase().includes(this.searchText) || track.artist.toLowerCase().includes(this.searchText) || track.album.toLowerCase().includes(this.searchText) || track.genre.toLowerCase().includes(this.searchText.toLowerCase())
                })
            },
            deletePrevText() {
                if (Id('search-input').value == 0) {
                    // Lets restore pool
                    this.updatePool(this.cachedPool)
                } else {
                    // We force a re-evaluation of track search during 'backspacing'
                    this.mutateST()
                }
            }
        },
        computed: {
            ...mapGetters([
                'searchText',
                'currentCriteria',
                'filteredPool',
                'currentTarget'
            ]),
        }
    }
</script>

<style lang="stylus" scoped>
    .holder
        margin-top 35px
        user-select none

    .search-icon
        height 36px
        margin-left 12px
        margin-right 14px
        cursor pointer

    ::placeholder
        color #7C7C7C

    input
        outline none
        height 20px
        width 160px
        padding 6px
        padding-left 16px
        background #F2F2F2
        color #7C7C7C
        border-radius 5px
        border none
        transition 0.1s ease-in

    input:focus
        border-color rgb(78,149,255)
        border-width 2px
        border-style solid

    .search-icon
        path
            transition fill 0.15s ease-in
            fill #cecece

    .search-icon:hover
        path
            fill #a0a0a0

    .div-hor
        display flex
        flex-flow row
        align-items center
</style>
