<?php
require_once __DIR__.'/../vendor/autoload.php';
require_once 'debug.php';
require_once __DIR__.'/../vendor/pagseguro/source/PagSeguroLibrary/PagSeguroLibrary.php';

$app = new Silex\Application();

$app['debug'] = true;

$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/../templates',
    'auto_reload' => true,
    'debug' => true,
));

/**
 * Index
 */
$app->get('/', function () use ($app) {
    return $app['twig']->render('site/index.twig');
});

$app->get('/admin', function () use ($app) {
    return $app['twig']->render('dashboard/index.twig');
});

$app->get('/portfolio-sacolas', function () use ($app) {
    return $app['twig']->render('site/bag-portfolio.twig');
});

$app->get('/precos', function () use ($app) {
    return $app['twig']->render('site/prices.twig');
});

$app->get('/contato', function () use ($app) {
    return $app['twig']->render('site/contact.twig');
});

$app->get('/pagseguro', function () use ($app) {
    // Instantiate a new payment request
    $paymentRequest = new PagSeguroPaymentRequest();

    // Sets the currency
    $paymentRequest->setCurrency("BRL");

    $preApprovalItem = $_POST['preApproval'] | '3';

    // in future notifications.
    $paymentRequest->setReference("REF123");

    $preApproval = new PagSeguroPreApproval();
    $preApproval->setCharge('manual');

    switch($preApprovalItem) {
        case '1':
            $dayOfMonth = date('d');
            if ($dayOfMonth > 28) {
                $dayOfMonth = 1;
            }
            $value = '14.99';
            $paymentRequest->addItem('0001', 'Assinatura mensal', 1, $value);
            $preApproval->setAmountPerPayment($value)
                ->setMaxAmountPerPeriod($value)->setPeriod('MONTHLY')->setDayOfMonth($dayOfMonth)
                ->setName('Assinatura do plano mensal do aplicativo Izie')
                ->setMaxTotalAmount($value * 12)
                ->setDetails('Todo mês será cobrado o valor referente ao plano na data de adesão')
                ->setInitialDate(date('Y-m-d\TH:i:s'))->setFinalDate(date('Y-m-d\TH:i:s', strtotime('+24 month')));
            break;
        case '2':
            $dayOfMonth = date('d');
            if ($dayOfMonth > 28) {
                $dayOfMonth = 1;
            }
            $value = number_format(6 * 12.99,2);
            $paymentRequest->addItem('0002', 'Assinatura semestral', 1, $value);
            $preApproval->setAmountPerPayment($value)
                ->setMaxAmountPerPeriod($value * 4)
                ->setMaxTotalAmount($value * 4)
                ->setPeriod('SEMIANNUALLY')->setDayOfMonth($dayOfMonth)
                ->setName('Assinatura do plano semestral do aplicativo Izie')
                ->setDetails('A cada 6 meses será cobrado o valor referente ao plano na data de adesão')
                ->setInitialDate(date('Y-m-d\TH:i:s'))->setFinalDate(date('Y-m-d\TH:i:s', strtotime('+24 month')));
            break;
        case '3':
            $dayOfMonth = date('d');
            $month      = date('m');
            if ($dayOfMonth > 28) {
                $dayOfMonth = 1;
                $month = $month + 1;
            }
            $value = number_format(12 * 9.99, 2);

            $paymentRequest->addItem('0003', 'Assinatura anual', 1, $value);
            $preApproval->setAmountPerPayment($value)
                ->setMaxAmountPerPeriod(number_format($value * 2,2))
                ->setMaxTotalAmount(number_format($value * 2,2))
                ->setPeriod('YEARLY')->setDayOfYear($month.'-'.$dayOfMonth)
                ->setName('Assinatura do plano anual do aplicativo Izie')
                ->setDetails('Todo ano será cobrado o valor referente ao plano na data de adesão')
                ->setInitialDate(date('Y-m-d\TH:i:s'))->setFinalDate(date('Y-m-d\TH:i:s', strtotime('+24 month')));
            break;
    }

    $preApproval->setReviewURL('http://www.google.com');
    $paymentRequest->setPreApproval($preApproval);

    // Sets your customer information.
    $paymentRequest->setSender(
        'Daphynne Crispim',
        'miss.dap@gmail.com',
        '61',
        '82006226',
        'CPF',
        '019.997.181-19'
    );

    // Sets the url used by PagSeguro for redirect user after ends checkout process
    $paymentRequest->setRedirectUrl("http://www.bagshow.com.br/");

    try {
        /*
         * #### Credentials #####
         * Substitute the parameters below with your credentials (e-mail and token)
         * You can also get your credentials from a config file. See an example:
         * $credentials = PagSeguroConfig::getAccountCredentials();
         */
        $credentials = new PagSeguroAccountCredentials("felipe.neuhauss@gmail.com", "200E09FE6C9E4965B5FD1A088650912C");
        // Register this payment request in PagSeguro, to obtain the payment URL for redirect your customer.
        $url = $paymentRequest->register($credentials);

        header("Location: ".$url);
        exit;
    } catch (Exception $e) {
        debug($e->getMessage());
    }
});

/**
 * Login
 */
$app->get('/login', function () use ($app) {
    return $app['twig']->render('login/index.twig');
});

/**
 * Cliente
 */
$app->match('/clientes', function () use ($app) {
    return $app['twig']->render('customer/list.twig');
})->method('GET|POST');

$app->match('/cliente/{id}', function ($id = '') use ($app) {
    return $app['twig']->render('customer/form.twig', array('id' => $id));
})->method('GET|POST');

$app->match('/cliente/', function ($id = '') use ($app) {
    return $app['twig']->render('customer/form.twig', array('id' => $id));
})->method('GET|POST');

/**
 * Cartoes de visita
 */
$app->match('/cartao/{id}', function ($id = '') use ($app) {
    return $app['twig']->render('business-card/form.twig', array('id' => $id));
})->method('GET|POST');

$app->match('/cartao/', function ($id = '') use ($app) {
    return $app['twig']->render('business-card/form.twig', array('id' => $id));
})->method('GET|POST');

$app->match('/cartoes', function ($id = '') use ($app) {
    return $app['twig']->render('business-card/gallery.twig', array('id' => $id));
})->method('GET|POST');

/**
 * Bolsas
 */
$app->match('/bolsa/{id}', function ($id = '') use ($app) {
    return $app['twig']->render('bag/form.twig', array('id' => $id));
})->method('GET|POST');

$app->match('/bolsa/', function ($id = '') use ($app) {
    return $app['twig']->render('bag/form.twig', array('id' => $id));
})->method('GET|POST');

$app->match('/bolsas', function ($id = '') use ($app) {
    return $app['twig']->render('bag/gallery.twig', array('id' => $id));
})->method('GET|POST');

/**
 * Cliente Facebook
 */
$app->match('/facebook/clientes', function () use ($app, $verifyLoginFacebook) {
    $verifyLoginFacebook('http://localhost/facebook/clientes');
    return $app['twig']->render('customer/facebook.twig');
})->method('GET');

$app->match('/facebook/clientes/', function () use ($app) {
    return $app->json($app['facebook']->api('/me/friends', 'GET', array()));
})->method('POST');

$app->match('/facebook/cliente/{id}', function ($id) use ($app) {
    return $app->json($app['facebook']->api('/'.$id, 'GET', array()));
})->method('POST');


/**
 *Image
 */
$app->match('/crop-image', function () use ($app) {
    $imageURL = $_POST['imageUrl'] || 'https://storage.googleapis.com/kinvey_production_7601edb4da7a4112aa2ec7485163b224/00fec0c8-e845-405e-b574-8826f99ed875/Gestante%20Animal_Print.JPG';

    list($s_w, $s_h) = getimagesize($imageURL);

    $targ_w = 273;
    $targ_h = 170;
    $jpeg_quality = 90;

    $src   = $imageURL;
    $img_r = imagecreatefromjpeg($src);
    $dst_r = ImageCreateTrueColor($targ_w, $targ_h);

    imagecopyresampled($dst_r, $img_r, 0 ,0 , $_POST['x1'], $_POST['y1'], $_POST['x2'], $_POST['y2'] , $s_w, $s_h);

    $file_d = md5($imageURL).'.JPG';
    $dir_d = '../crop-tmp/';
    $destiny = $dir_d.$file_d;
    //header('Content-type: image/jpeg');
    imagejpeg($dst_r, $destiny , $jpeg_quality);
    $contentCrop = file_get_contents($destiny);
    $mimeType    = mime_content_type($destiny);

    return $contentCrop;
})->method('GET|POST');


$app->run();