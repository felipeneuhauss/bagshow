<?php

/**
 @author: felipe.neuhauss@gmail.com
 @version: 1.0
 @description: Classe criada para gerar pagamento recorrente
*/

/**
 * Shipping information
 */
class PagSeguroPreApproval
{
    /*
     * 'auto'
     */
    private $charge;

    /*
     * Super seguro para notebook
     */
    private $name;
    /*
     * Ex.: Toda segunda feira será cobrado o valor de R$150,00 para o seguro do notebook
     */
    private $details;

    /*
     * '150.00'. 2 casas decimais
     */
    private $amountPerPayment;

    /*
    WEEKLY para toda semana;
    MONTHLY para todo mes;
    BIMONTHLY para a cada dois meses;
    TRIMONTHLY para cada três meses;
    SEMIANNUALLY a cada seis meses.
    YEARLY para cada ano;
     */
    private $period;

    /*
    MONDAY para toda Segunda-Feira
    TUESDAY para toda Terça-Feira
    WEDNESDAY para toda Quarta-Feira
    THURSDAY para toda Quinta-Feira
    FRIDAY para toda Sexta-Feira
    SATURDAY para todo Sabado
    SUNDAY para todo Domingo
     */
    private $dayOfWeek;

    /*
     * Dos dias 1 ao 28.
     */
    private $dayOfMonth;

    /*
     * Utilize esse campo caso no parâmetro preApprovalPeriod esteja configurado como YEARLY.
     * exemplo: MM-dd
     */
    private $dayOfYear;

    /*
     * YYYY-MM-DDThh:mm:ss.sTZD.
     * Ex: 2015-01-17T19:20:30.45-03:00
     */
    private $initialDate;

    /*
     * Essa data obviamente deverá não ser inferior a data atual, e não poderá ser superior até dois anos da data atual
     */
    private $finalDate;

    /*
     * Nesse parâmetro deve ser informado qual valor total máximo que o PagSeguro irá cobrar dentro do período.
     * Entre 1.00 e 2000.00.
     */
    private $maxAmountPerPeriod;

    /*
     * Nesse parâmetro deve ser informado qual valor total máximo que o PagSeguro irá cobrar enquanto a assinatura for válida.
     * Entre 1.00 e 35000.00.
     */
    private $maxTotalAmount;

    /*
     * Pagina com as regras da assinatura
     */
    private $reviewURL;

    /**
     * Initializes a new instance of the PagSeguroShipping class
     * @param array $data
     */
    public function __construct(array $data = null)
    {
        if ($data) {

            if (isset($data['charge'])) {
                $this->charge = $data['charge'];
            }
            if (isset($data['name'])) {
                $this->name = $data['name'];
            }
            if (isset($data['details'])) {
                $this->details = $data['details'];
            }
            if (isset($data['amountPerPayment'])) {
                $this->amountPerPayment = $data['amountPerPayment'];
            }
            if (isset($data['period'])) {
                $this->period = $data['period'];
            }
            if (isset($data['dayOfWeek'])) {
                $this->dayOfWeek = $data['dayOfWeek'];
            }
            if (isset($data['dayOfMonth'])) {
                $this->dayOfMonth = $data['dayOfMonth'];
            }
            if (isset($data['dayOfYear'])) {
                $this->dayOfYear = $data['dayOfYear'];
            }
            if (isset($data['initialDate'])) {
                $this->initialDate = $data['initialDate'];
            }
            if (isset($data['finalDate'])) {
                $this->finalDate = $data['finalDate'];
            }
            if (isset($data['maxAmountPerPeriod'])) {
                $this->maxAmountPerPeriod = $data['maxAmountPerPeriod'];
            }
            if (isset($data['maxTotalAmount'])) {
                $this->maxTotalAmount = $data['maxTotalAmount'];
            }
            if (isset($data['reviewURL'])) {
                $this->reviewURL = $data['reviewURL'];
            }
        }
    }

    /**
     * @param mixed $amountPerPayment
     */
    public function setAmountPerPayment($amountPerPayment)
    {
        $this->amountPerPayment = $amountPerPayment;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getAmountPerPayment()
    {
        return $this->amountPerPayment;
    }

    /**
     * @param mixed $charge
     */
    public function setCharge($charge)
    {
        $this->charge = $charge;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getCharge()
    {
        return $this->charge;
    }

    /**
     * @param mixed $dayOfMonth
     */
    public function setDayOfMonth($dayOfMonth)
    {
        $this->dayOfMonth = $dayOfMonth;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDayOfMonth()
    {
        return $this->dayOfMonth;
    }

    /**
     * @param mixed $dayOfWeek
     */
    public function setDayOfWeek($dayOfWeek)
    {
        $this->dayOfWeek = $dayOfWeek;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDayOfWeek()
    {
        return $this->dayOfWeek;
    }

    /**
     * @param mixed $dayOfYear
     */
    public function setDayOfYear($dayOfYear)
    {
        $this->dayOfYear = $dayOfYear;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDayOfYear()
    {
        return $this->dayOfYear;
    }

    /**
     * @param mixed $details
     */
    public function setDetails($details)
    {
        $this->details = $details;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDetails()
    {
        return $this->details;
    }

    /**
     * @param mixed $finalDate
     */
    public function setFinalDate($finalDate)
    {
        $this->finalDate = $finalDate;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getFinalDate()
    {
        return $this->finalDate;
    }

    /**
     * @param mixed $initialDate
     */
    public function setInitialDate($initialDate)
    {
        $this->initialDate = $initialDate;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getInitialDate()
    {
        return $this->initialDate;
    }

    /**
     * @param mixed $maxAmountPerPeriod
     */
    public function setMaxAmountPerPeriod($maxAmountPerPeriod)
    {
        $this->maxAmountPerPeriod = $maxAmountPerPeriod;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getMaxAmountPerPeriod()
    {
        return $this->maxAmountPerPeriod;
    }

    /**
     * @param mixed $maxTotalAmount
     */
    public function setMaxTotalAmount($maxTotalAmount)
    {
        $this->maxTotalAmount = $maxTotalAmount;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getMaxTotalAmount()
    {
        return $this->maxTotalAmount;
    }

    /**
     * @param mixed $name
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param mixed $period
     */
    public function setPeriod($period)
    {
        $this->period = $period;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getPeriod()
    {
        return $this->period;
    }

    /**
     * @param mixed $reviewURL
     */
    public function setReviewURL($reviewURL)
    {
        $this->reviewURL = $reviewURL;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getReviewURL()
    {
        return $this->reviewURL;
    }


}
