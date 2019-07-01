$(function(){
    $(".containsPiece").click(function() {
        $(this).parent().find(".selected").removeClass("selected");
        $(this).addClass("selected");
    });
});