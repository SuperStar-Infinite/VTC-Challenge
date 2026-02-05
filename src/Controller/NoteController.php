<?php
declare(strict_types=1);

namespace App\Controller;

use App\Entity\Note;
use App\Entity\User;
use App\Repository\NoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/notes')]
class NoteController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private NoteRepository $noteRepository,
    ) {
    }

    #[Route('', name: 'api_notes_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user === null) {
            return $this->json(null, Response::HTTP_UNAUTHORIZED);
        }

        $query = $request->query->get('q');
        $status = $request->query->get('status');
        $category = $request->query->get('category');

        $notes = $this->noteRepository->searchForUser($user, $query, $status, $category);

        return $this->json(array_map([$this, 'serializeNote'], $notes));
    }

    #[Route('', name: 'api_notes_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user === null) {
            return $this->json(null, Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode((string) $request->getContent(), true) ?? [];
        $title = (string) ($data['title'] ?? '');
        $content = (string) ($data['content'] ?? '');
        $category = (string) ($data['category'] ?? '');
        $status = (string) ($data['status'] ?? Note::STATUS_NEW);

        if ($title === '' || $content === '' || $category === '') {
            return $this->json(['error' => 'Title, content and category are required'], Response::HTTP_BAD_REQUEST);
        }

        if (!\in_array($status, [Note::STATUS_NEW, Note::STATUS_TODO, Note::STATUS_DONE], true)) {
            return $this->json(['error' => 'Invalid status'], Response::HTTP_BAD_REQUEST);
        }

        $note = new Note();
        $note
            ->setTitle($title)
            ->setContent($content)
            ->setCategory($category)
            ->setStatus($status)
            ->setOwner($user);

        $this->em->persist($note);
        $this->em->flush();

        return $this->json($this->serializeNote($note), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_notes_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user === null) {
            return $this->json(null, Response::HTTP_UNAUTHORIZED);
        }

        /** @var Note|null $note */
        $note = $this->noteRepository->find($id);
        if ($note === null || $note->getOwner()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Note not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode((string) $request->getContent(), true) ?? [];

        if (isset($data['title'])) {
            $note->setTitle((string) $data['title']);
        }
        if (isset($data['content'])) {
            $note->setContent((string) $data['content']);
        }
        if (isset($data['category'])) {
            $note->setCategory((string) $data['category']);
        }
        if (isset($data['status'])) {
            $status = (string) $data['status'];
            if (!\in_array($status, [Note::STATUS_NEW, Note::STATUS_TODO, Note::STATUS_DONE], true)) {
                return $this->json(['error' => 'Invalid status'], Response::HTTP_BAD_REQUEST);
            }
            $note->setStatus($status);
        }

        $this->em->flush();

        return $this->json($this->serializeNote($note));
    }

    #[Route('/{id}', name: 'api_notes_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getAuthenticatedUser();
        if ($user === null) {
            return $this->json(null, Response::HTTP_UNAUTHORIZED);
        }

        /** @var Note|null $note */
        $note = $this->noteRepository->find($id);
        if ($note === null || $note->getOwner()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Note not found'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($note);
        $this->em->flush();

        return $this->json(['message' => 'Note deleted']);
    }

    private function getAuthenticatedUser(): ?User
    {
        $user = $this->getUser();
        if (!$user instanceof User || $user->getId() === null) {
            return null;
        }

        // Re-fetch the user from database to ensure it's a managed entity
        // This is necessary because the user from session might be detached
        $managedUser = $this->em->getRepository(User::class)->find($user->getId());
        
        return $managedUser instanceof User ? $managedUser : null;
    }

    private function serializeNote(Note $note): array
    {
        return [
            'id' => $note->getId(),
            'title' => $note->getTitle(),
            'content' => $note->getContent(),
            'category' => $note->getCategory(),
            'status' => $note->getStatus(),
        ];
    }
}

