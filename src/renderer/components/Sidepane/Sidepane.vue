<template>
    <div class="virtical-div">
        <div v-for="item in listingOptions" class="entity" @click="changeTarget(item)" :class="{activeTarget: typeof currentTarget == 'object' ? currentTarget.name == item.name : currentTarget == item, greyedText: item == playingTarget}">
            <p>
                {{ typeof item == 'object' ? item.name : item }}
            </p>
        </div>
        <div class="empty-listing" v-if="listingOptions.length == 0">
            <h4>
                No {{ currentCriteria }} found
            </h4>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    export default {
        name: 'sidepane',
        methods: {
            ...mapActions([
                'changeTarget'
            ]),
        },
        computed: {
            ...mapGetters([
                'currentCriteria',
                'currentTarget',
                'playingTarget',
                'allArtists',
                'allAlbums',
                'allGenres',
                'allPlaylists'
            ]),
            listingOptions() {
                return this.currentCriteria == 'music' ? [
                    'All Tracks',
                    '80s Music',
                    '90s Music',
                    '2000s Music',
                    'Favourites'
                ] : eval('this.all'+this.currentCriteria[0].toUpperCase() + this.currentCriteria.slice(1)+'s')
            }
        }
    }
</script>

<style lang="stylus">
    .virtical-div
        position absolute
        top 0
        left 0
        width 180px
        height 100%
        padding-left 60px
        padding-right 10px
        color #a0a0a0
        background #ececec
        z-index -999
        .entity
            p
                margin 18px
                cursor pointer
                font-weight bold
                transition all 0.4s ease
                user-select none

        .empty-listing
            padding-top 100px
            padding-left 18px
            user-select none
            h4
                color #cecece

    .entity:first-child
        padding-top 100px

    .greyedText
        color #cecece

    .activeTarget
        color dodgerblue
</style>
