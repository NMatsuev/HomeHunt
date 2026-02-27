// context/OffersContext.js
import React, { createContext, useContext, useState } from "react";

const INITIAL_OFFERS = [
  {
    id: "1",
    title: "Квартира в центре",
    price: "12 500 000 ₽",
    rooms: 3,
    area: 75,
    floor: "5",
    floorCount: 12,
    address: "ул. Тверская, 15, Москва",
    description:
      "Просторная квартира с панорамными окнами, отличный вариант для семьи. Рядом метро, парк и вся необходимая инфраструктура.",
    image: "https://via.placeholder.com/100x100/ff6b6b/ffffff?text=🏠",
  },
  {
    id: "2",
    title: "Студия в новостройке",
    price: "8 200 000 ₽",
    rooms: 1,
    area: 32,
    floor: "8",
    floorCount: 25,
    address: "ул. Ленина, 42, Москва",
    description:
      "Уютная студия с чистовой отделкой, подходит для инвестиций или проживания. Дом сдан, можно заезжать.",
    image: "https://via.placeholder.com/100x100/4ecdc4/ffffff?text=🏢",
  },
  {
    id: "3",
    title: "Двухуровневая квартира",
    price: "18 700 000 ₽",
    rooms: 4,
    area: 120,
    floor: "14-15",
    floorCount: 15,
    address: "пр. Мира, 87, Москва",
    description:
      "Эксклюзивное предложение - двухуровневая квартира с террасой и прекрасным видом на город.",
    image: "https://via.placeholder.com/100x100/ffd93d/ffffff?text=🏛️",
  },
  {
    id: "4",
    title: "Квартира у парка",
    price: "9 900 000 ₽",
    rooms: 2,
    area: 54,
    floor: "3",
    floorCount: 9,
    address: "ул. Парковая, 5, Москва",
    description:
      "Светлая квартира с выходом на парк. Хороший ремонт, встроенная кухня, кондиционер.",
    image: "https://via.placeholder.com/100x100/6c5ce7/ffffff?text=🌳",
  },
  {
    id: "5",
    title: "Пентхаус с террасой",
    price: "25 000 000 ₽",
    rooms: 5,
    area: 150,
    floor: "16",
    floorCount: 16,
    address: "наб. Тараса Шевченко, 3, Москва",
    description:
      "Роскошный пентхаус с собственной террасой 50 м², панорамным остеклением и видом на Москва-Сити.",
    image: "https://via.placeholder.com/100x100/e17055/ffffff?text=🏰",
  },
];

const OffersContext = createContext();

export const OffersProvider = ({ children }) => {
  const [offers, setOffers] = useState(INITIAL_OFFERS);

  const deleteOffer = (offerId) => {
    setOffers(offers.filter((offer) => offer.id !== offerId));
  };

  const editOffer = (editedOffer) => {
    setOffers(
      offers.map((offer) =>
        offer.id === editedOffer.id ? editedOffer : offer,
      ),
    );
  };

  const addOffer = (newOffer) => {
    setOffers([newOffer, ...offers]);
  };

  return (
    <OffersContext.Provider
      value={{ offers, deleteOffer, editOffer, addOffer }}
    >
      {children}
    </OffersContext.Provider>
  );
};

export const useOffers = () => {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error("useOffers must be used within OffersProvider");
  }
  return context;
};
