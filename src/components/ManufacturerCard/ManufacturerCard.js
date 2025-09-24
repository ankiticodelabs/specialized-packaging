// RentalsSlider.js
import React from "react";
import Slider from "react-slick";
import css from "./ManufacturerCard.module.css";
import image1 from "../../assets/images/img1.jpg";
import image2 from "../../assets/images/img2.jpg";
import image3 from "../../assets/images/img3.jpg";
import image4 from "../../assets/images/img4.jpg";
const rentals = [
  {
    title: "Power Spakeging",
    image: image1,
  },
  {
    title: "Recreation Rentals",
    image: image2,
  },
  {
    title: "Water Sport Rentals",
    image: image3,
  },
  {
    title: "Camping Rentals",
    image: image4,
  },
];

const ManufacturerCard = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 1320,
        settings: {
          slidesToShow: 3.2,
          slidesToScroll: 1,
          centerMode: true,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.5,
          slidesToScroll: 1,
          initialSlide: 1,
          centerMode: true,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2.1,
          slidesToScroll: 1,
          initialSlide: 1,
          centerMode: true,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
          initialSlide: 1,
          centerMode: true,
        }
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          centerMode: true,
        }
      }
    ]
  };

  return (
    <div className={css.sliderWrapper}>
      <Slider {...settings}>
        {rentals.map((item, index) => (
          <div key={index} className={css.card}>
            <img src={item.image} alt={item.title} className={css.image} />
            <div className={css.text}>{item.title}</div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ManufacturerCard;
