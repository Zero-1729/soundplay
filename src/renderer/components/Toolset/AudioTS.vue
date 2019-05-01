<template>
    <div class="main-toolset-container">
        <div id="music-icon" class="item" :class="{activeIcon: currentCriteria == 'music'}">
            <div class="bar" :class="{greyBar: playingCriteria == 'music' && currentCriteria != 'music'}" v-if="currentCriteria == 'music' || playingCriteria == 'music'"></div>
            <svg class="icon" :class="{greyedIcon: playingCriteria == 'music' && currentCriteria != 'music'}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="12.531 148.128 13 14.303" width="13" height="14.303" @click="updateAndSelect">
                <path d=" M 24.334 155.91 L 24.334 153.536 L 17.321 155.589 L 17.321 160.036 L 17.321 160.378 L 17.297 160.378 C 17.13 161.538 16.132 162.431 14.926 162.431 C 13.605 162.431 12.531 161.358 12.531 160.036 C 12.531 158.715 13.605 157.641 14.926 157.641 C 15.293 157.641 15.641 157.724 15.953 157.872 L 15.953 155.178 C 15.953 155.027 16.07 154.871 16.216 154.829 L 25.268 152.243 C 25.414 152.201 25.531 152.29 25.531 152.441 L 25.531 157.641 L 25.507 157.641 C 25.523 157.753 25.531 157.867 25.531 157.984 C 25.531 159.305 24.458 160.378 23.137 160.378 C 21.815 160.378 20.742 159.305 20.742 157.984 C 20.742 156.662 21.815 155.589 23.137 155.589 C 23.573 155.589 23.982 155.706 24.334 155.91 Z  M 16.216 150.724 L 25.268 148.138 C 25.414 148.096 25.531 148.185 25.531 148.336 L 25.531 150.526 C 25.531 150.677 25.414 150.833 25.268 150.875 L 16.216 153.461 C 16.07 153.503 15.953 153.414 15.953 153.263 L 15.953 151.073 C 15.953 150.922 16.07 150.766 16.216 150.724 Z " fill-rule="evenodd"/>
            </svg>
        </div>
        <div id="album-icon" class="item" :class="{activeIcon: currentCriteria == 'album'}">
            <div class="bar" v-if="currentCriteria == 'album' || playingCriteria == 'album'" :class="{greyBar: playingCriteria == 'album' && currentCriteria != 'album'}"></div>
            <svg class="icon" :class="{greyedIcon: playingCriteria == 'album' && currentCriteria != 'album'}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="512 500.753 17 23.247" width="17" height="22.247" @click="handle_criteria('album')">
                <path d=" M 522.958 509.253 L 527.976 509.253 C 527.976 505.127 524.626 501.777 520.5 501.777 C 516.374 501.777 513.024 505.127 513.024 509.253 L 513.024 509.253 L 518.042 509.253 C 518.042 507.896 519.143 506.795 520.5 506.795 C 521.857 506.795 522.958 507.896 522.958 509.253 Z  M 522.036 509.253 L 518.964 509.253 C 518.964 508.405 519.652 507.717 520.5 507.717 C 521.348 507.717 522.036 508.405 522.036 509.253 Z  M 512 509.253 C 512 504.562 515.809 500.753 520.5 500.753 C 525.191 500.753 529 504.562 529 509.253 L 529 523 L 512 523 L 512 509.253 L 512 509.253 L 512 509.253 L 512 509.253 L 512 509.253 Z " fill-rule="evenodd" />
            </svg>
        </div>
        <div id="artist-icon" class="item" :class="{activeIcon: currentCriteria == 'artist'}">
            <div class="bar" v-if="currentCriteria == 'artist' || playingCriteria == 'artist'" :class="{greyBar: playingCriteria == 'artist' && currentCriteria != 'artist'}"></div>
            <svg class="icon" :class="{greyedIcon: playingCriteria == 'artist' && currentCriteria != 'artist'}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="546 501.5 11 24.247" width="13" height="24" @click="handle_criteria('artist')">
                <path d=" M 556.646 506.331 C 556.646 504.358 554.34 502.757 551.5 502.757 L 551.5 502.757 C 548.66 502.757 546.354 504.358 546.354 506.331 L 546.354 508.929 L 556.646 508.929 L 556.646 506.331 L 556.646 506.331 Z  M 558 506.529 C 558 503.753 555.087 501.5 551.5 501.5 L 551.5 501.5 C 547.913 501.5 545 503.753 545 506.529 L 545 510.187 L 558 510.187 L 558 506.529 L 558 506.529 Z  M 558 512.016 L 558 514.985 C 558 517.606 555.402 519.762 552.091 519.993 L 552.091 524.144 L 557.474 524.144 C 557.764 524.144 558 524.374 558 524.657 L 558 524.987 C 558 525.27 557.764 525.5 557.474 525.5 L 545.526 525.5 C 545.236 525.5 545 525.27 545 524.987 L 545 524.657 C 545 524.374 545.236 524.144 545.526 524.144 L 550.909 524.144 L 550.909 519.993 C 547.598 519.762 545 517.606 545 514.985 L 545 512.016 L 558 512.016 L 558 512.016 Z " fill-rule="evenodd" />
            </svg>
        </div>
        <div id="genre-icon" class="item" :class="{activeIcon: currentCriteria == 'genre'}">
            <div class="bar" v-if="currentCriteria == 'genre' || playingCriteria == 'genre'" :class="{greyBar: playingCriteria == 'genre' && currentCriteria != 'genre'}"></div>
            <svg class="icon" :class="{greyedIcon: playingCriteria == 'genre' && currentCriteria != 'genre'}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="11.313 193.338 15 15" width="15" height="15" @click="handle_criteria('genre')">
                <path d=" M 11.313 200.838 C 11.313 196.699 14.674 193.338 18.813 193.338 C 22.952 193.338 26.313 196.699 26.313 200.838 C 26.313 204.978 22.952 208.338 18.813 208.338 C 14.674 208.338 11.313 204.978 11.313 200.838 Z  M 17.25 200.838 C 17.25 199.976 17.951 199.276 18.813 199.276 C 19.675 199.276 20.375 199.976 20.375 200.838 C 20.375 201.701 19.675 202.401 18.813 202.401 C 17.951 202.401 17.25 201.701 17.25 200.838 Z " fill-rule="evenodd"/>
            </svg>
        </div>
        <div class="item playlist-icon" :class="{activeIcon: currentCriteria == 'playlist'}">
            <div class="bar" v-if="currentCriteria == 'playlist' || playingCriteria == 'playlist'" :class="{greyBar: playingCriteria == 'playlist' && currentCriteria != 'playlist'}"></div>
            <svg class="icon" :class="{greyedIcon: playingCriteria == 'playlist' && currentCriteria != 'playlist'}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="10.813 391.338 16 14.554" width="16" height="14.554" @click="handle_criteria('playlist')">
                <path d=" M 22.536 402.614 L 22.536 396.016 L 26.243 396.942 C 26.558 397.021 26.813 396.822 26.813 396.498 L 26.813 393.268 C 26.813 392.944 26.558 392.617 26.243 392.539 L 21.511 391.356 C 21.197 391.277 20.941 391.476 20.941 391.8 L 20.941 400.334 C 20.544 400.134 20.095 400.02 19.62 400.02 C 18 400.02 16.685 401.336 16.685 402.956 C 16.685 404.577 18 405.892 19.62 405.892 C 21.241 405.892 22.556 404.577 22.556 402.956 C 22.556 402.841 22.549 402.726 22.536 402.614 L 22.536 402.614 L 22.536 402.614 Z  M 11.694 391.338 L 18.74 391.338 C 19.226 391.338 19.62 391.667 19.62 392.072 L 19.62 392.072 C 19.62 392.477 19.226 392.806 18.74 392.806 L 11.694 392.806 C 11.208 392.806 10.813 392.477 10.813 392.072 L 10.813 392.072 C 10.813 391.667 11.208 391.338 11.694 391.338 L 11.694 391.338 L 11.694 391.338 Z  M 11.694 394.548 L 18.74 394.548 C 19.226 394.548 19.62 394.877 19.62 395.282 L 19.62 395.282 C 19.62 395.687 19.226 396.016 18.74 396.016 L 11.694 396.016 C 11.208 396.016 10.813 395.687 10.813 395.282 L 10.813 395.282 C 10.813 394.877 11.208 394.548 11.694 394.548 L 11.694 394.548 Z  M 11.694 397.757 L 15.804 397.757 C 16.29 397.757 16.685 398.086 16.685 398.491 L 16.685 398.491 C 16.685 398.896 16.29 399.225 15.804 399.225 L 11.694 399.225 C 11.208 399.225 10.813 398.896 10.813 398.491 L 10.813 398.491 C 10.813 398.086 11.208 397.757 11.694 397.757 Z " fill-rule="evenodd" />
            </svg>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'

    export default {
        name: 'audio-ts',
        data() {
            return {
                cachedPlayingCriteria: null
            }
        },
        mounted() {
            // Changing the route seems to mutate this
            this.cachedPlayingCriteria = this.playingCriteria
        },
        watch: {
            '$route' (cur, old) {
                // ... so we therefore have to cache it and manually
                // ... reset it each time the route is mutated
                this.updatePlayingCriteria(this.cachedPlayingCriteria)
            },

            playingCriteria (cur, old) {
                // We keep them in sync
                this.cachedPlayingCriteria = cur
            }
        },
        methods: {
            ...mapActions([
                'updateCriteria',
                'updatePlayingCriteria',
                'changeTarget',
                'cacheRoute',
                'setSettings'
            ]),

            updateAndSelect() {
                this.handle_criteria('music')
                this.changeTarget('All Tracks')
            },

            handle_criteria(criteria) {
                if (this.settingsOpen) {
                    this.setSettings(false)

                    this.cacheRoute({
                        type: 'main',
                        name: '/'
                    })
                }

                this.updateCriteria(criteria)
            }
        },
        computed: {
            ...mapGetters([
                'currentCriteria',
                'playingCriteria',
                'settingsOpen'
            ])
        }
    }
</script>

<style lang="stylus">
    .main-toolset-container
        position absolute
        top 110px
        left 0
        width 50px
        height 254px
        border-top-right-radius 5px
        border-bottom-right-radius 5px

    .item
        padding 15px
        position relative
        display flex

        svg
            height 20px
            width 20px

        svg:active
            transform scale(0.9)

    #album-icon
        svg
            height 21px

    #artist-icon
        svg
            height 24px

    #genre-icon
        svg
            height 19px


    .bar
        position absolute
        left 0
        height 25px
        width 3px
        margin-right 2px

    .icon
        cursor pointer
</style>
