<template>
  <div
    class="context-menu options">
    <button
      title="Edit current cell"
      @click="$emit('select-for-editing', $event)">
      Edit
    </button>
    <button
      title="Start writing a function"
      @click="$emit('set-value', [null, '=']); $emit('select-for-editing', $event)">
      Function
    </button>
  </div>
</template>

<script>
export default {
}
</script>

<style>

</style>
