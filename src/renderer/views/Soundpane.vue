<template>
    <div class="soundpane">
        <Sidepane></Sidepane>
        <Trackspane></Trackspane>
    </div>
</template>

<script>
    import Sidepane      from  './../components/Sidepane/Sidepane.vue'
    import Trackspane    from  './../components/Trackspane/Trackspane.vue'

    import { QuerySelectorAll }  from './../utils/htmlQuery'

    export default {
        name: 'soundpane',
        components: {
            Sidepane,
            Trackspane
        },
        mounted() {
            // Watch for window resizing to ensure thead's ths aligns properly with the tbody's tds
            var vm = this

            // Lets resisze it if the scrollbars are visible on landing
            this.resizeThead()

            window.addEventListener('resize', () => {
                vm.resizeThead()
            })
        },
        methods: {
            resizeThead() {
                var thead = QuerySelectorAll('thead')[0]
                var tbody = QuerySelectorAll('tbody')[0]

                if (tbody.scrollHeight > tbody.clientHeight) {
                    // We use the static width of the window not the table
                    // ... To avoid mutating both thead and tbody
                    thead.style.width = String(window.innerWidth - 250 - 1.5) + "px"
                } else {
                    // If no scollbars are detected the width is automatically
                    // ... the window's minus the sidpane's width
                    thead.style.width = String(window.innerWidth - 250) + "px"
                }
            }
        }
    }
</script>
