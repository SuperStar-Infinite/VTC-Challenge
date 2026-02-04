<?php
declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class IndexController extends AbstractController
{
    /**
     * @Route("/index", name="app_index")
     * @Route("/", name="app_home")
     * @Route("/confirm", name="app_confirm_page")
     */
    public function index(): Response
    {
        return $this->render('index.html.twig');
    }
}
