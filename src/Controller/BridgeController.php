<?php

declare(strict_types=1);

namespace NewsMailForge\Controller;

use NewsMailForge\Core\Lang;
use NewsMailForge\Core\Request;
use NewsMailForge\Core\Response;
use NewsMailForge\Service\EmailBridgeService;

/**
 * Agnostic Bridge Controller for template persistence.
 * Follows strict MVC constraints (<= 15 lines per action).
 *
 * @author Uziel Almeida Oliveira (uzielweb)
 * @license MIT
 */
final class BridgeController
{
    public function __construct(private EmailBridgeService $service)
    {
    }

    public function handleRequest(?Request $request = null): Response
    {
        $req = $request ?? Request::createFromGlobals();
        $action = (string) ($req->getQuery('action') ?? $req->getJson('action', ''));
        return match ($action) {
            'save' => $this->saveAction($req),
            'load' => $this->loadAction($req),
            'list' => $this->listAction($req),
            'delete' => $this->deleteAction($req),
            default => Response::json(['error' => Lang::t('bridge.error.unsupported_action')], 400),
        };
    }

    public function saveAction(Request $request): Response
    {
        try {
            $data = $this->service->save($request->getBody());
            return Response::json($data, 200);
        } catch (\InvalidArgumentException $e) {
            return Response::json(['error' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            return Response::json(['error' => Lang::t('bridge.error.storage_failure')], 500);
        }
    }

    public function loadAction(Request $request): Response
    {
        $id = (string) ($request->getQuery('id') ?? $request->getJson('id', ''));
        if ($id === '') {
            return Response::json(['error' => Lang::t('bridge.error.missing_id')], 400);
        }
        $doc = $this->service->load($id);
        if (!$doc) {
            return Response::json(['error' => Lang::t('bridge.error.not_found')], 404);
        }
        return Response::json(['data' => $doc->toArray(), 'message' => Lang::t('bridge.success.load')], 200);
    }

    public function listAction(Request $request): Response
    {
        $limit = (int) ($request->getQuery('limit') ?? 50);
        $items = $this->service->list($limit);
        return Response::json(['data' => $items, 'message' => Lang::t('bridge.success.list')], 200);
    }

    public function deleteAction(Request $request): Response
    {
        $id = (string) ($request->getQuery('id') ?? $request->getJson('id', ''));
        if ($id === '') {
            return Response::json(['error' => Lang::t('bridge.error.missing_id')], 400);
        }
        $ok = $this->service->delete($id);
        $status = $ok ? 200 : 404;
        $msg = $ok ? Lang::t('bridge.success.delete') : Lang::t('bridge.error.not_found');
        return Response::json(['success' => $ok, 'message' => $msg], $status);
    }
}
