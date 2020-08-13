<template>
    <div class="div-hor holder" :class="{collapsed: collapsePane}">
        <input id="search-input" :placeholder="'Search ' + currentCriteria[0].toUpperCase()+currentCriteria.slice(1)" @input="mutateST" @click="highlight" @keyup.esc="blur" @keydown.enter.prevent="blur" @blur="blur"/>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import { Id } from './../../utils/htmlQuery'

    export default {
        name: 'search',
        props: ['searchText'],
        methods: {
            mutateSearchText (value) {
                this.$emit('mutateSearchText', value)
            },

            highlight() {
                Id('search-input').select()
                this.$emit('lockHotKey', 'input')
            },

            blur() {
                Id('search-input').blur()
                this.$emit('unlockHotKey', 'input')
            },

            mutateST() {
                this.$emit('mutateSearchText', event.target.value)
            }
        },
        computed: {
            ...mapGetters([
                'currentCriteria',
                'currentTarget',
                'collapsePane'
            ])
        }
    }
</script>

<style lang="stylus" scoped>
    .holder
        margin-top 35px
        user-select none

    div.holder.collapsed
        display none

    input
        height 20px
        width 146px
        font-size 10px
        padding 6px
        padding-left 16px
        margin-top 8px
        margin-left 92px
        border-radius 5px
        border none
        z-index 99999
        transition border 0.2s ease-in

    input:focus
        width 124px
        border-width 2px
        border-style solid

    .div-hor
        display flex
        flex-flow row
        align-items center
</style>
