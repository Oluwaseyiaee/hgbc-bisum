$(document).ready(function () {
  $(".speaker-slider").slick({
    infinite: true, // Enable infinite scrolling
    slidesToShow: 3, // Show 3 items at a time
    slidesToScroll: 1, // Scroll 1 item at a time
    autoplay: true, // Enable autoplay
    autoplaySpeed: 5000, // Slide every 2 seconds
    dots: true, // Show navigation dots
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  });
});
