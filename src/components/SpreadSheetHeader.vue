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

<style>

</style>
