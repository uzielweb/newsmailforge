<?php

declare(strict_types=1);

namespace NewsMailForge\Drivers;

use NewsMailForge\Contracts\StorageDriverInterface;
use NewsMailForge\Core\Lang;
use NewsMailForge\DTO\EmailDocumentDTO;

/**
 * Flexible Closure-based Storage Driver for seamless integration
 * into CMS platforms (Joomla, WordPress, Drupal) and frameworks (Laravel, Symfony).
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */
final class CallbackStorageDriver implements StorageDriverInterface
{
    /** @var (callable(EmailDocumentDTO): array)|null */
    private $onSave;
    /** @var (callable(string): ?EmailDocumentDTO)|null */
    private $onLoad;
    /** @var (callable(int): array)|null */
    private $onList;
    /** @var (callable(string): bool)|null */
    private $onDelete;

    public function __construct(
        ?callable $onSave = null,
        ?callable $onLoad = null,
        ?callable $onList = null,
        ?callable $onDelete = null
    ) {
        $this->onSave = $onSave;
        $this->onLoad = $onLoad;
        $this->onList = $onList;
        $this->onDelete = $onDelete;
    }

    public function save(EmailDocumentDTO $dto): array
    {
        if ($this->onSave === null) {
            throw new \BadMethodCallException(Lang::t('bridge.error.unsupported_action'));
        }
        return ($this->onSave)($dto);
    }

    public function load(string $id): ?EmailDocumentDTO
    {
        if ($this->onLoad === null) {
            throw new \BadMethodCallException(Lang::t('bridge.error.unsupported_action'));
        }
        return ($this->onLoad)($id);
    }

    public function list(int $limit = 50): array
    {
        if ($this->onList === null) {
            return [];
        }
        return ($this->onList)($limit);
    }

    public function delete(string $id): bool
    {
        if ($this->onDelete === null) {
            throw new \BadMethodCallException(Lang::t('bridge.error.unsupported_action'));
        }
        return (bool) ($this->onDelete)($id);
    }
}
