<template>
  <tr class="header">
    <th class="empty"/>
    <th
      v-for="(column, index) in headerContent"
      :key="index">
      {{ index }}
    </th>
  </tr>
</template>

<script>
export default {
  props: ['headerContent']
}
</script>

<style scoped>
  th {
    border: .5px solid var(--separator);
    user-select: none;
    position: relative;
    height: 2.5rem;
    overflow: hidden;
    outline: 0;
  }
  th {
    border-bottom: 1px solid var(--separator-highlight);
  }
  th.empty {
    width: 2rem;
    cursor: default;
    background-color: var(--separator-highlight);
  }
</style>
