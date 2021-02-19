<template>
  <td class="sidebar">{{ value }}</td>
</template>

<script>
export default {
  props: ['value']
}
</script>

<style scoped>
  td.sidebar {
    width: 2rem;
    cursor: default;
    font-weight: bold;
    border-right: 1px solid var(--separator-highlight);
  }
</style>
