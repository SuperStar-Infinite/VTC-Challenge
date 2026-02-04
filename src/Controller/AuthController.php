<?php
declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\String\ByteString;

#[Route('/api')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode((string) $request->getContent(), true) ?? [];
        $email = isset($data['email']) ? (string) $data['email'] : '';
        $password = isset($data['password']) ? (string) $data['password'] : '';

        if ($email === '' || $password === '') {
            return $this->json(['error' => 'Email and password are required'], Response::HTTP_BAD_REQUEST);
        }

        if ($this->userRepository->findOneByEmail($email) !== null) {
            return $this->json(['error' => 'User already exists'], Response::HTTP_BAD_REQUEST);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));
        $user->setIsConfirmed(false);
        $token = ByteString::fromRandom(32)->toString();
        $user->setConfirmationToken($token);

        $this->em->persist($user);
        $this->em->flush();

        // Persist a "fake" email in var/emails as per challenge requirements
        $this->storeConfirmationEmail($email, $token);

        return $this->json([
            'message' => 'User registered. Please confirm your email.',
        ], Response::HTTP_CREATED);
    }

    #[Route('/confirm/{token}', name: 'api_confirm', methods: ['GET'])]
    public function confirm(string $token): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->userRepository->findOneBy(['confirmationToken' => $token]);
        if ($user === null) {
            return $this->json(['error' => 'Invalid or expired confirmation token'], Response::HTTP_BAD_REQUEST);
        }

        $user->setIsConfirmed(true);
        $user->setConfirmationToken(null);
        $this->em->flush();

        return $this->json(['message' => 'Account confirmed, you can now login.']);
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(null, Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'email' => $user->getEmail(),
            'confirmed' => $user->isConfirmed(),
        ]);
    }

    private function storeConfirmationEmail(string $email, string $token): void
    {
        $dir = $this->getParameter('kernel.project_dir') . '/var/emails';
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        $link = sprintf('http://localhost:81/confirm?token=%s', $token);
        $body = sprintf("To: %s\n\nPlease confirm your account by visiting: %s\n", $email, $link);

        $filename = $dir . '/confirmation_' . time() . '_' . md5($email . $token) . '.txt';
        file_put_contents($filename, $body);
    }
}

