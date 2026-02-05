<?php
declare(strict_types=1);

namespace App\Repository;

use App\Entity\Note;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Note>
 */
class NoteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Note::class);
    }

    /**
     * @return Note[]
     */
    public function searchForUser(
        User $user,
        ?string $query,
        ?string $status,
        ?string $category
    ): array {
        // Ensure user is managed by this entity manager
        $em = $this->getEntityManager();
        if (!$em->contains($user)) {
            $user = $em->getRepository(User::class)->find($user->getId());
            if ($user === null) {
                return [];
            }
        }

        // Simple DQL query - find notes where owner matches
        $dql = 'SELECT n FROM App\Entity\Note n WHERE n.owner = :owner ORDER BY n.id DESC';
        $dqlQuery = $em->createQuery($dql);
        $dqlQuery->setParameter('owner', $user);
        $notes = $dqlQuery->getResult();
        
        // Apply text search filter
        if ($query !== null && $query !== '') {
            $searchLower = mb_strtolower($query);
            $notes = array_filter($notes, function($note) use ($searchLower) {
                return strpos(mb_strtolower($note->getTitle()), $searchLower) !== false
                    || strpos(mb_strtolower($note->getContent()), $searchLower) !== false;
            });
        }
        
        // Apply status filter
        if ($status !== null && $status !== '') {
            $notes = array_filter($notes, function($note) use ($status) {
                return $note->getStatus() === $status;
            });
        }
        
        // Apply category filter
        if ($category !== null && $category !== '') {
            $notes = array_filter($notes, function($note) use ($category) {
                return $note->getCategory() === $category;
            });
        }
        
        return array_values($notes);

        if ($query !== null && $query !== '') {
            $qb
                ->andWhere('LOWER(n.title) LIKE :q OR LOWER(n.content) LIKE :q')
                ->setParameter('q', '%' . mb_strtolower($query) . '%');
        }

        if ($status !== null && $status !== '') {
            $qb
                ->andWhere('n.status = :status')
                ->setParameter('status', $status);
        }

        if ($category !== null && $category !== '') {
            $qb
                ->andWhere('n.category = :category')
                ->setParameter('category', $category);
        }

        return $qb->getQuery()->getResult();
    }
}

