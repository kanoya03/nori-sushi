import i18n from 'i18next';

import {
  initReactI18next,
} from 'react-i18next';

import {
  getLocales,
} from 'expo-localization';

export type AppLanguage =
  | 'ru'
  | 'en';

export const getSystemLanguage =
  (): AppLanguage => {
    const languageCode =
      getLocales()[0]
        ?.languageCode;

    return languageCode === 'ru'
      ? 'ru'
      : 'en';
  };

const resources = {
  ru: {
    translation: {
      common: {
        loading: 'Загрузка...',
        back: 'Назад',
        error: 'Ошибка',
        free: 'Бесплатно',
        total: 'Итого',
        products: 'Товары',
        delivery: 'Доставка',
        pickup: 'Самовывоз',
        choose: 'Выбрать',
        change: 'Изменить',
        cancel: 'Отмена',
        quantityShort: 'шт.',
      },

      tabs: {
        menu: 'Меню',
        profile: 'Профиль',
        favorites: 'Любимые',
        cart: 'Корзина',
      },

      drawer: {
        profile: 'Профиль',
        menu: 'Меню',
        cart: 'Корзина',
        favorites: 'Любимые',
        orders: 'История заказов',
        promotions: 'Акции',
        notifications:
          'Уведомления',
        about: 'О нас',

        publicOffer:
          'Публичная оферта',

        privacyPolicy:
          'Политика конфиденциальности',
      },

      home: {
        menu: 'Меню',
        all: 'Все',

        nothingFound:
          'Ничего не найдено',
      },

      delivery: {
        delivery: 'Доставка',
        pickup: 'Самовывоз',
      },

      address: {
        specifyAddress:
          'Укажите адрес',

        deliveryAddress:
          'Адрес доставки',

        pickupPoint:
          'Пункт самовывоза',

        choosePickupPoint:
          'Выберите пункт самовывоза',

        cityStreetHouse:
          'Город, улица, дом',

        apartment: 'Квартира',
        entrance: 'Подъезд',
        floor: 'Этаж',

        apartmentShort: 'кв.',
        entranceShort: 'подъезд',
        floorShort: 'этаж',

        courierComment:
          'Комментарий для курьера',

        pickupPoints:
          'Пункты самовывоза',
      },

      promo: {
        badge: 'АКЦИЯ',
        title: 'Скидка 20%',
        subtitle:
          'на первый заказ',
        order: 'Заказать',
      },

      search: {
        title: 'Поиск',

        placeholder:
          'Название блюда',

        startTyping:
          'Начните вводить название блюда',

        nothingFound:
          'Ничего не найдено',

        changeQuery:
          'Попробуйте изменить запрос',
      },

      product: {
        notFound:
          'Товар не найден',

        price: 'Цена',
        serving: '1 порция',
        added: 'Добавлено',

        addToCart:
          'Добавить в корзину',
      },

      favorites: {
        title: 'Любимые',

        emptyTitle:
          'Пока ничего нет',

        emptyText:
          'Добавляйте любимые блюда, нажимая на сердечко',
      },

      cart: {
        title: 'Корзина',

        emptyTitle:
          'Корзина пуста',

        emptyText:
          'Добавьте роллы или суши из меню',

        remove: 'Удалить',
        total: 'Итого',

        checkout:
          'Оформить заказ',
      },

      checkout: {
        title:
          'Оформление заказа',

        receivingMethod:
          'Способ получения',

        deliveryAddress:
          'Адрес доставки',

        pickupPoint:
          'Пункт самовывоза',

        addAddress:
          '+ Добавить адрес',

        choosePickup:
          '+ Выбрать пункт самовывоза',

        paymentMethod:
          'Способ оплаты',

        cardOnDelivery:
          'Картой при получении',

        cash: 'Наличными',
        online: 'Онлайн',
        soon: 'Скоро',

        orderComment:
          'Комментарий к заказу',

        commentPlaceholder:
          'Например: без имбиря',

        yourOrder:
          'Ваш заказ',

        minimumTitle:
          'Минимальная сумма',

        minimumMessage:
          'Минимальная сумма заказа — {{amount}}',

        minimumRemaining:
          'До минимальной суммы заказа не хватает {{amount}}',

        confirming:
          'Оформляем...',

        confirm:
          'Подтвердить заказ · {{amount}} ₸',

        deliveryAlertTitle:
          'Адрес доставки',

        deliveryAlertMessage:
          'Сначала укажите адрес доставки',

        pickupAlertTitle:
          'Самовывоз',

        pickupAlertMessage:
          'Сначала выберите пункт самовывоза',

        emptyCartTitle:
          'Корзина',

        emptyCartMessage:
          'Корзина пуста',

        orderError:
          'Не удалось оформить заказ',
      },

      orderSuccess: {
        title:
          'Заказ оформлен',

        orderNumber:
          'Заказ #{{id}}',

        description:
          'Мы получили ваш заказ. Статус можно отслеживать в истории заказов.',

        viewOrder:
          'Посмотреть заказ',

        home:
          'На главную',
      },

      orders: {
        title:
          'История заказов',

        loadError:
          'Не удалось загрузить заказы',

        emptyTitle:
          'Заказов пока нет',

        emptyText:
          'После оформления заказа он появится здесь',

        orderNumber:
          'Заказ #{{id}}',

        status: {
          PENDING:
            'Ожидает подтверждения',

          CONFIRMED:
            'Подтверждён',

          PREPARING:
            'Готовится',

          DELIVERING:
            'В пути',

          COMPLETED:
            'Завершён',

          CANCELLED:
            'Отменён',
        },
      },

      orderDetails: {
        orderNumber:
          'Заказ #{{id}}',

        loadError:
          'Не удалось загрузить заказ',

        statusTitle:
          'Статус заказа',

        cancelled:
          'Заказ отменён',

        statusSteps: {
          PENDING:
            'Заказ принят',

          CONFIRMED:
            'Подтверждён',

          PREPARING:
            'Готовится',

          DELIVERING:
            'В пути',

          COMPLETED:
            'Доставлен',
        },

        composition:
          'Состав заказа',

        receiving:
          'Получение',

        payment:
          'Оплата',

        cash:
          'Наличными',

        cardOnDelivery:
          'Картой при получении',

        comment:
          'Комментарий',

        repeat:
          'Повторить заказ',

        repeating:
          'Добавляем...',

        cancelOrder:
          'Отменить заказ',

        cancelling:
          'Отмена...',

        cancelTitle:
          'Отменить заказ?',

        cancelMessage:
          'Вы уверены, что хотите отменить заказ?',

        no: 'Нет',

        yesCancel:
          'Да, отменить',

        cancelError:
          'Не удалось отменить заказ',

        repeatSuccessTitle:
          'Корзина',

        repeatSuccess:
          'Товары из заказа добавлены в корзину',

        repeatError:
          'Не удалось повторить заказ. Возможно, некоторые товары больше недоступны.',
      },

      deliveryMap: {
        locationTitle:
          'Геолокация',

        locationPermission:
          'Разрешите доступ к геолокации, чтобы определять адрес на карте',

        locationDenied:
          'Нет разрешения на использование геолокации',

        pickupTitle:
          'Самовывоз',

        choosePickup:
          'Выберите пункт самовывоза',

        addressTitle:
          'Адрес',

        addressFormat:
          'Введите адрес в формате: город, улица, дом',

        updateError:
          'Не удалось обновить адрес',

        saveError:
          'Не удалось сохранить адрес',

        saving:
          'Сохранение...',

        choosePoint:
          'Выбрать пункт →',

        continue:
          'Продолжить →',
      },

      editProfile: {
        title:
          'Редактирование',

        firstName: 'Имя',
        lastName: 'Фамилия',

        gender: 'Пол',
        male: 'Мужчина',
        female: 'Женщина',

        birthDate:
          'Дата рождения',

        chooseDate:
          'Выберите дату',

        email: 'Email',
        signInEmail: 'Почта для входа через Google',
        contactEmail: 'Контактная почта',

        save: 'Сохранить',

        saving:
          'Сохранение...',

        saveError:
          'Не удалось сохранить профиль',
      },

      auth: {
        title:
          'Авторизация',

        subtitle:
          'Войдите через Google или Telegram, чтобы получить доступ к профилю',

        consent:
          'Даю согласие на сбор и обработку персональных данных',

        consentRequired:
          'Необходимо согласиться на обработку персональных данных',

        googleNotConfigured:
          'Google авторизация не настроена',

        authInProgress:
          'Авторизация уже выполняется',

        playServicesUnavailable:
          'Google Play Services недоступны',

        googleError:
          'Не удалось войти через Google',

        telegramError:
          'Не удалось открыть Telegram',

        sessionNotFound:
          'Сессия авторизации не найдена',

        codeLength:
          'Введите 6-значный код',

        invalidCode:
          'Неверный или просроченный код',

        google:
          'Войти через Google',

        telegram:
          'Войти через Telegram',

        enterCode:
          'Введите код',

        codeSent:
          'Мы отправили 6-значный код в Telegram',

        confirm:
          'Подтвердить',

        privacy:
          'Политика конфиденциальности и обработки персональных данных',
      },

      promotions: {
        title: 'Акции',

        heroTitle:
          'Выгодные предложения',

        heroText:
          'Выберите подходящую акцию и перейдите к заказу',

        openMenu:
          'Открыть меню',

        available:
          'Сейчас доступны',

        first: {
          title:
            'Сет со скидкой 15%',

          description:
            'Скидка на выбранные большие сеты при заказе через приложение.',

          badge: '-15%',

          button:
            'Выбрать блюда',
        },

        second: {
          title:
            'Бесплатная доставка',

          description:
            'Бесплатная доставка при заказе от 10 000 ₸.',

          badge: '0 ₸',

          button:
            'Перейти в меню',
        },

        third: {
          title:
            'Ролл в подарок',

          description:
            'Получите дополнительный ролл при заказе двух специальных сетов.',

          badge: 'Подарок',

          button:
            'Посмотреть меню',
        },

        demoNotice:
          'Акции пока используются в демонстрационном режиме.',
      },

      about: {
        title: 'О нас',

        brandSubtitle:
          'Доставка суши',

        aboutTitle:
          'О NORI SUSHI',

        paragraphOne:
          'NORI SUSHI — сервис доставки суши и роллов, в котором можно выбрать блюда, собрать заказ и оформить доставку прямо в приложении.',

        paragraphTwo:
          'Здесь также можно сохранять любимые блюда, просматривать историю заказов и быстро повторять прошлые заказы.',

        features:
          'Возможности приложения',

        menu: 'Меню',

        menuDescription:
          'Перейти к выбору блюд',

        favorites:
          'Любимые',

        favoritesDescription:
          'Открыть сохранённые блюда',

        orders:
          'История заказов',

        ordersDescription:
          'Посмотреть прошлые заказы',

        delivery:
          'Доставка',

        deliveryDescription:
          'Открыть адрес доставки',

        goToMenu:
          'Перейти в меню',

        version:
          'Версия 1.0.0',
      },

      notifications: {
        title:
          'Уведомления',

        specialOffers:
          'Специальные предложения',

        specialOffersText:
          'Посмотрите доступные акции NORI SUSHI',

        orders: 'Заказы',

        emptyTitle:
          'Уведомлений пока нет',

        emptyText:
          'После оформления заказа его статус появится здесь',

        orderNumber:
          'Заказ #{{id}}',

        status: {
          PENDING:
            'Заказ принят и ожидает подтверждения',

          CONFIRMED:
            'Заказ подтверждён',

          PREPARING:
            'Ваш заказ готовится',

          DELIVERING:
            'Заказ уже в пути',

          COMPLETED:
            'Заказ доставлен',

          CANCELLED:
            'Заказ отменён',

          DEFAULT:
            'Статус заказа изменён',
        },
      },

      profile: {
        title: 'Профиль',

        guestTitle:
          'Войдите в профиль',

        guestDescription:
          'Войдите, чтобы получить доступ к своему профилю',

        login: 'Войти',

        user: 'Пользователь',

        googleConnected:
          'Google подключён',

        telegramConnected:
          'Telegram подключён',

        accountConnected:
          'Аккаунт подключён',

        favorites: 'Любимые',
        orders: 'История заказов',
        promotions: 'Акции',

        notifications:
          'Уведомления',

        about: 'О нас',

        editProfile:
          'Редактировать профиль',

        logout: 'Выйти',

        language: 'Язык',
        russian: 'Русский',
        english: 'English',

        chooseLanguage:
          'Выберите язык',
      },
    },
  },

  en: {
    translation: {
      common: {
        loading: 'Loading...',
        back: 'Back',
        error: 'Error',
        free: 'Free',
        total: 'Total',
        products: 'Items',
        delivery: 'Delivery',
        pickup: 'Pickup',
        choose: 'Choose',
        change: 'Change',
        cancel: 'Cancel',
        quantityShort: 'pcs.',
      },

      tabs: {
        menu: 'Menu',
        profile: 'Profile',
        favorites: 'Favorites',
        cart: 'Cart',
      },

      drawer: {
        profile: 'Profile',
        menu: 'Menu',
        cart: 'Cart',
        favorites: 'Favorites',
        orders: 'Order history',
        promotions: 'Promotions',
        notifications:
          'Notifications',
        about: 'About us',

        publicOffer:
          'Public offer',

        privacyPolicy:
          'Privacy policy',
      },

      home: {
        menu: 'Menu',
        all: 'All',

        nothingFound:
          'Nothing found',
      },

      delivery: {
        delivery: 'Delivery',
        pickup: 'Pickup',
      },

      address: {
        specifyAddress:
          'Enter address',

        deliveryAddress:
          'Delivery address',

        pickupPoint:
          'Pickup point',

        choosePickupPoint:
          'Choose a pickup point',

        cityStreetHouse:
          'City, street, house',

        apartment:
          'Apartment',

        entrance:
          'Entrance',

        floor: 'Floor',

        apartmentShort:
          'apt.',

        entranceShort:
          'entrance',

        floorShort:
          'floor',

        courierComment:
          'Comment for courier',

        pickupPoints:
          'Pickup points',
      },

      promo: {
        badge: 'PROMO',
        title: '20% off',

        subtitle:
          'your first order',

        order: 'Order now',
      },

      search: {
        title: 'Search',

        placeholder:
          'Dish name',

        startTyping:
          'Start typing a dish name',

        nothingFound:
          'Nothing found',

        changeQuery:
          'Try changing your search',
      },

      product: {
        notFound:
          'Product not found',

        price: 'Price',
        serving: '1 serving',
        added: 'Added',

        addToCart:
          'Add to cart',
      },

      favorites: {
        title: 'Favorites',

        emptyTitle:
          'Nothing here yet',

        emptyText:
          'Tap the heart to save your favorite dishes',
      },

      cart: {
        title: 'Cart',

        emptyTitle:
          'Your cart is empty',

        emptyText:
          'Add rolls or sushi from the menu',

        remove: 'Remove',
        total: 'Total',
        checkout: 'Checkout',
      },

      checkout: {
        title: 'Checkout',

        receivingMethod:
          'Receiving method',

        deliveryAddress:
          'Delivery address',

        pickupPoint:
          'Pickup point',

        addAddress:
          '+ Add address',

        choosePickup:
          '+ Choose pickup point',

        paymentMethod:
          'Payment method',

        cardOnDelivery:
          'Card on delivery',

        cash: 'Cash',
        online: 'Online',
        soon: 'Coming soon',

        orderComment:
          'Order comment',

        commentPlaceholder:
          'For example: no ginger',

        yourOrder:
          'Your order',

        minimumTitle:
          'Minimum order',

        minimumMessage:
          'Minimum order amount is {{amount}}',

        minimumRemaining:
          '{{amount}} more is needed to reach the minimum order amount',

        confirming:
          'Placing order...',

        confirm:
          'Confirm order · {{amount}} ₸',

        deliveryAlertTitle:
          'Delivery address',

        deliveryAlertMessage:
          'Please enter a delivery address first',

        pickupAlertTitle:
          'Pickup',

        pickupAlertMessage:
          'Please choose a pickup point first',

        emptyCartTitle:
          'Cart',

        emptyCartMessage:
          'Your cart is empty',

        orderError:
          'Could not place the order',
      },

      orderSuccess: {
        title:
          'Order placed',

        orderNumber:
          'Order #{{id}}',

        description:
          'We received your order. You can track its status in your order history.',

        viewOrder:
          'View order',

        home:
          'Go to home',
      },

      orders: {
        title:
          'Order history',

        loadError:
          'Could not load orders',

        emptyTitle:
          'No orders yet',

        emptyText:
          'Your orders will appear here after checkout',

        orderNumber:
          'Order #{{id}}',

        status: {
          PENDING:
            'Awaiting confirmation',

          CONFIRMED:
            'Confirmed',

          PREPARING:
            'Preparing',

          DELIVERING:
            'On the way',

          COMPLETED:
            'Completed',

          CANCELLED:
            'Cancelled',
        },
      },

      orderDetails: {
        orderNumber:
          'Order #{{id}}',

        loadError:
          'Could not load order',

        statusTitle:
          'Order status',

        cancelled:
          'Order cancelled',

        statusSteps: {
          PENDING:
            'Order received',

          CONFIRMED:
            'Confirmed',

          PREPARING:
            'Preparing',

          DELIVERING:
            'On the way',

          COMPLETED:
            'Delivered',
        },

        composition:
          'Order items',

        receiving:
          'Receiving',

        payment:
          'Payment',

        cash: 'Cash',

        cardOnDelivery:
          'Card on delivery',

        comment:
          'Comment',

        repeat:
          'Repeat order',

        repeating:
          'Adding...',

        cancelOrder:
          'Cancel order',

        cancelling:
          'Cancelling...',

        cancelTitle:
          'Cancel order?',

        cancelMessage:
          'Are you sure you want to cancel this order?',

        no: 'No',

        yesCancel:
          'Yes, cancel',

        cancelError:
          'Could not cancel the order',

        repeatSuccessTitle:
          'Cart',

        repeatSuccess:
          'Order items were added to your cart',

        repeatError:
          'Could not repeat the order. Some items may no longer be available.',
      },

      deliveryMap: {
        locationTitle:
          'Location',

        locationPermission:
          'Allow location access to detect your address on the map',

        locationDenied:
          'Location permission was not granted',

        pickupTitle:
          'Pickup',

        choosePickup:
          'Choose a pickup point',

        addressTitle:
          'Address',

        addressFormat:
          'Enter the address in this format: city, street, house',

        updateError:
          'Could not update the address',

        saveError:
          'Could not save the address',

        saving:
          'Saving...',

        choosePoint:
          'Choose point →',

        continue:
          'Continue →',
      },

      editProfile: {
        title:
          'Edit profile',

        firstName:
          'First name',

        lastName:
          'Last name',

        gender: 'Gender',
        male: 'Male',
        female: 'Female',

        birthDate:
          'Date of birth',

        chooseDate:
          'Choose date',

        email: 'Email',
        signInEmail: 'Google sign-in email',
        contactEmail: 'Contact email',

        save: 'Save',

        saving:
          'Saving...',

        saveError:
          'Could not save profile',
      },

      auth: {
        title:
          'Sign in',

        subtitle:
          'Sign in with Google or Telegram to access your profile',

        consent:
          'I consent to the collection and processing of my personal data',

        consentRequired:
          'You need to consent to personal data processing',

        googleNotConfigured:
          'Google sign-in is not configured',

        authInProgress:
          'Sign-in is already in progress',

        playServicesUnavailable:
          'Google Play Services are unavailable',

        googleError:
          'Could not sign in with Google',

        telegramError:
          'Could not open Telegram',

        sessionNotFound:
          'Authorization session was not found',

        codeLength:
          'Enter the 6-digit code',

        invalidCode:
          'The code is invalid or has expired',

        google:
          'Continue with Google',

        telegram:
          'Continue with Telegram',

        enterCode:
          'Enter code',

        codeSent:
          'We sent a 6-digit code to Telegram',

        confirm:
          'Confirm',

        privacy:
          'Privacy and personal data processing policy',
      },

      promotions: {
        title: 'Promotions',

        heroTitle:
          'Special offers',

        heroText:
          'Choose an offer and start your order',

        openMenu:
          'Open menu',

        available:
          'Available now',

        first: {
          title:
            '15% off a set',

          description:
            'Get a discount on selected large sets when ordering through the app.',

          badge: '-15%',

          button:
            'Choose dishes',
        },

        second: {
          title:
            'Free delivery',

          description:
            'Free delivery for orders over 10,000 ₸.',

          badge: '0 ₸',

          button:
            'Go to menu',
        },

        third: {
          title:
            'Free roll',

          description:
            'Get an extra roll when you order two special sets.',

          badge: 'Gift',

          button:
            'View menu',
        },

        demoNotice:
          'Promotions are currently shown in demo mode.',
      },

      about: {
        title: 'About us',

        brandSubtitle:
          'Sushi delivery',

        aboutTitle:
          'About NORI SUSHI',

        paragraphOne:
          'NORI SUSHI is a sushi and roll delivery service where you can choose dishes, build your order and arrange delivery directly in the app.',

        paragraphTwo:
          'You can also save your favorite dishes, view your order history and quickly repeat previous orders.',

        features:
          'App features',

        menu: 'Menu',

        menuDescription:
          'Choose your dishes',

        favorites:
          'Favorites',

        favoritesDescription:
          'Open saved dishes',

        orders:
          'Order history',

        ordersDescription:
          'View previous orders',

        delivery:
          'Delivery',

        deliveryDescription:
          'Open delivery address',

        goToMenu:
          'Go to menu',

        version:
          'Version 1.0.0',
      },

      notifications: {
        title:
          'Notifications',

        specialOffers:
          'Special offers',

        specialOffersText:
          'Check out the latest NORI SUSHI promotions',

        orders: 'Orders',

        emptyTitle:
          'No notifications yet',

        emptyText:
          'Your order status will appear here after checkout',

        orderNumber:
          'Order #{{id}}',

        status: {
          PENDING:
            'Your order was received and is awaiting confirmation',

          CONFIRMED:
            'Your order has been confirmed',

          PREPARING:
            'Your order is being prepared',

          DELIVERING:
            'Your order is on the way',

          COMPLETED:
            'Your order has been delivered',

          CANCELLED:
            'Your order has been cancelled',

          DEFAULT:
            'Order status has changed',
        },
      },

      profile: {
        title: 'Profile',

        guestTitle:
          'Sign in to your profile',

        guestDescription:
          'Sign in to access your profile',

        login: 'Sign in',

        user: 'User',

        googleConnected:
          'Google connected',

        telegramConnected:
          'Telegram connected',

        accountConnected:
          'Account connected',

        favorites: 'Favorites',
        orders: 'Order history',

        promotions:
          'Promotions',

        notifications:
          'Notifications',

        about: 'About us',

        editProfile:
          'Edit profile',

        logout: 'Log out',

        language: 'Language',
        russian: 'Русский',
        english: 'English',

        chooseLanguage:
          'Choose language',
      },
    },
  },
};

void i18n
  .use(initReactI18next)
  .init({
    resources,

    lng:
      getSystemLanguage(),

    fallbackLng: 'en',

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
