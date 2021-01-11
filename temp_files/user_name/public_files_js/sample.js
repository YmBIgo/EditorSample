<!--css擬似要素をjQueryで動的に変更-->
<script type="text/javascript">
jQuery(function($){
var item = $('.box');
var c = 0;
setInterval(function(){
  c++;
    item.attr('data-item', (c % 2 == 0) ? 'お得情報' : 'あわせて読みたい'); /* 属性値を変更 */
}, 2000);
});
</script>