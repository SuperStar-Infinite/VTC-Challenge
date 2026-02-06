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
    // public function searchForUser(
    //     User $user,
    //     ?string $query,
    //     ?string $status,
    //     ?string $category
    // ): array {
    //     error_log("Searching notes for user ID: " . $user->getId());

    //     $qb = $this->createQueryBuilder('n')
    //         ->join('n.owner', 'u')
    //         ->andWhere('u.id = :ownerId')
    //         ->setParameter('ownerId', $user->getId())
    //         ->orderBy('n.id', 'DESC');

    //     if ($query !== null && $query !== '') {
    //         $qb
    //             ->andWhere('LOWER(n.title) LIKE :q OR LOWER(n.content) LIKE :q')
    //             ->setParameter('q', '%' . mb_strtolower($query) . '%');
    //     }

    //     if ($status !== null && $status !== '') {
    //         $qb
    //             ->andWhere('n.status = :status')
    //             ->setParameter('status', $status);
    //     }

    //     if ($category !== null && $category !== '') {
    //         $qb
    //             ->andWhere('n.category = :category')
    //             ->setParameter('category', $category);
    //     }

    //     $results = $qb->getQuery()->getResult();
    
    //     // DEBUG: Log how many notes found
    //     error_log("Found " . count($results) . " notes");
        
    //     return $results;
    // }

    public function searchForUser(
        User $user,
        ?string $query,
        ?string $status,
        ?string $category
    ): array {
        $dql = 'SELECT n FROM App\Entity\Note n WHERE n.owner = :user';
        $params = ['user' => $user];
        
        if ($query) {
            $dql .= ' AND (LOWER(n.title) LIKE :q OR LOWER(n.content) LIKE :q)';
            $params['q'] = '%' . mb_strtolower($query) . '%';
        }
        
        if ($status) {
            $dql .= ' AND n.status = :status';
            $params['status'] = $status;
        }
        
        if ($category) {
            $dql .= ' AND n.category = :category';
            $params['category'] = $category;
        }
        
        $dql .= ' ORDER BY n.id DESC';
        
        return $this->getEntityManager()
            ->createQuery($dql)
            ->setParameters($params)
            ->getResult();
    }
}

