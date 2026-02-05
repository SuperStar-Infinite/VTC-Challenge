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
        $qb = $this->createQueryBuilder('n')
            ->andWhere('n.owner = :owner')
            ->setParameter('owner', $user)
            ->orderBy('n.id', 'DESC');

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

