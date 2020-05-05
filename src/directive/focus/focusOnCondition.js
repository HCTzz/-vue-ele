export default {
    inserted: function(el, binding) {
        // 聚焦元素
        console.log(binding.value);
        if (binding.value.focus === binding.value.index) {
            el.focus();
        }
    }
  }
