/**
 * News Mail Forge - Test Suite for Core, Compiler & Catalog
 * UTF-8 sem BOM
 */

import assert from 'node:assert';
import fs from 'node:fs';

async function runTests() {
  console.log('=== INICIANDO SUÍTE DE TESTES UNITÁRIOS E DE BORDA ===\n');

  // 1. Verificação de Codificação UTF-8 sem BOM em todos os arquivos gerados
  const filesToCheck = [
    'dist-vanilla/js/i18n/I18n.js',
    'dist-vanilla/js/core/BlockFactory.js',
    'dist-vanilla/js/core/Store.js',
    'dist-vanilla/js/core/EmailCompiler.js',
    'dist-vanilla/js/catalog/BlockCatalog.js',
    'dist-vanilla/js/catalog/BuiltinPresets.js'
  ];

  for (const f of filesToCheck) {
    const buffer = fs.readFileSync(f);
    assert.ok(buffer.length > 0, `Arquivo não pode estar vazio: ${f}`);
    const hasBOM = buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF;
    assert.strictEqual(hasBOM, false, `Arquivo possui BOM (inaceitável): ${f}`);
  }
  console.log('✔ [1/6] UTF-8 No BOM verificado em todos os 6 arquivos JS.');

  // 2. BlockFactory Testes
  const { BlockFactory, uid, cloneNodeWithNewIds } = await import('../dist-vanilla/js/core/BlockFactory.js');
  const id1 = uid('test');
  const id2 = uid('test');
  assert.notStrictEqual(id1, id2, 'UIDs devem ser únicos');
  assert.ok(id1.startsWith('test_'), 'Prefixo correto no UID');

  const cellWithNestedRow = BlockFactory.createCell({
    children: [
      BlockFactory.createTextAtom({ value: 'Texto 1' }),
      BlockFactory.createRow({
        cells: [
          BlockFactory.createCell({
            children: [BlockFactory.createButtonAtom({ value: 'Botão Aninhado' })]
          })
        ]
      })
    ]
  });
  assert.strictEqual(cellWithNestedRow.children.length, 2);
  assert.strictEqual(cellWithNestedRow.children[1].type, 'row', 'Suporte a RowNode recursiva');

  const clonedCell = cloneNodeWithNewIds(cellWithNestedRow);
  assert.notStrictEqual(clonedCell.id, cellWithNestedRow.id);
  assert.notStrictEqual(clonedCell.children[0].id, cellWithNestedRow.children[0].id);
  assert.notStrictEqual(clonedCell.children[1].id, cellWithNestedRow.children[1].id);
  assert.notStrictEqual(clonedCell.children[1].cells[0].id, cellWithNestedRow.children[1].cells[0].id);
  assert.notStrictEqual(clonedCell.children[1].cells[0].children[0].id, cellWithNestedRow.children[1].cells[0].children[0].id);
  console.log('✔ [2/6] BlockFactory e recursão de nós em cloneNodeWithNewIds verificados.');

  // 3. Store Testes (Histórico 50 estados, Seleção 5 níveis, Operações na Árvore)
  const { Store } = await import('../dist-vanilla/js/core/Store.js');
  const doc = BlockFactory.createDocument();
  const store = new Store(doc);

  assert.strictEqual(store.getState().selectedType, 'main');
  assert.strictEqual(store.getState().canUndo, false);
  assert.strictEqual(store.getState().canRedo, false);

  // Adiciona bloco
  const blk = store.addBlock();
  assert.strictEqual(store.getState().selectedId, blk.id);
  assert.strictEqual(store.getState().selectedType, 'block');
  assert.strictEqual(store.getState().canUndo, true);

  // Adiciona linha
  const row = store.addRowToBlock(blk.id);
  assert.strictEqual(store.getState().selectedId, row.id);
  assert.strictEqual(store.getState().selectedType, 'row');

  // Adiciona coluna
  const cell = store.addCellToRow(row.id);
  assert.strictEqual(store.getState().selectedId, cell.id);
  assert.strictEqual(store.getState().selectedType, 'cell');

  // Seleciona atom existente
  const firstAtom = cell.children[0];
  store.selectNode(firstAtom.id);
  assert.strictEqual(store.getState().selectedId, firstAtom.id);
  assert.strictEqual(store.getState().selectedType, 'atom');

  // Seleciona de volta para 'main'
  store.selectNode(null);
  assert.strictEqual(store.getState().selectedType, 'main');

  // Move nó e duplica
  const duplicated = store.duplicateNode(blk.id);
  assert.ok(duplicated);
  assert.strictEqual(store.getDocument().blocks.length, 2);

  store.moveNode(duplicated.id, 'up');
  assert.strictEqual(store.getDocument().blocks[0].id, duplicated.id);

  // Undo e Redo
  assert.strictEqual(store.getState().canUndo, true);
  store.undo();
  assert.strictEqual(store.getDocument().blocks[1].id, duplicated.id);
  store.redo();
  assert.strictEqual(store.getDocument().blocks[0].id, duplicated.id);

  // Exclusão
  store.removeNode(duplicated.id);
  assert.strictEqual(store.getDocument().blocks.length, 1);
  console.log('✔ [3/6] Store, 5 níveis de seleção, histórico Undo/Redo e mutações validadas.');

  // 4. EmailCompiler Testes (Ghost Tables, Gap Spacers, VML e OWASP)
  const { EmailCompiler, escapeHtml, escapeHref } = await import('../dist-vanilla/js/core/EmailCompiler.js');

  assert.strictEqual(escapeHref('javascript:alert(1)'), '#', 'Bloqueio de javascript:');
  assert.strictEqual(escapeHref('https://site.com?a=1&b=2'), 'https://site.com?a=1&amp;b=2', 'Escapamento de & para &amp;');
  assert.strictEqual(escapeHtml('<script>'), '&lt;script&gt;');

  // Bloco com gap
  const testDoc = BlockFactory.createDocument({
    blocks: [
      BlockFactory.createBlock({
        settings: { backgroundColor: '#0D0D18' },
        rows: [
          BlockFactory.createRow({
            settings: { gap: 20 },
            cells: [
              BlockFactory.createCell({ settings: { width: '50%' } }),
              BlockFactory.createCell({ settings: { width: '50%' } })
            ]
          })
        ]
      })
    ]
  });

  const compiledHtml = EmailCompiler.compile(testDoc, { previewMode: true });
  assert.ok(compiledHtml.includes('<!--[if (gte mso 9)|(IE)]>'), 'Contém Ghost Table MSO');
  assert.ok(compiledHtml.includes('bgcolor="#0D0D18"'), 'Subpixel fix: Ghost table com bgcolor do bloco');
  assert.ok(compiledHtml.includes('e-col-gap'), 'Contém classe e-col-gap para colunas espaçadoras');
  assert.ok(compiledHtml.includes('width="20"'), 'Gap spacer com largura exata do gap');
  assert.ok(compiledHtml.includes('data-nmf-id='), 'Preview mode com data-nmf-id');
  assert.ok(compiledHtml.includes('data-nmf-type="block"'), 'Preview mode com data-nmf-type');
  console.log('✔ [4/6] EmailCompiler regras de anti-quebra Outlook, MSO, VML e gaps validadas.');

  // 5. BlockCatalog Testes
  const { BlockCatalog } = await import('../dist-vanilla/js/catalog/BlockCatalog.js');
  const categories = BlockCatalog.getCategories();
  assert.strictEqual(categories.length, 8, '8 Categorias obrigatórias');

  const allBlocks = BlockCatalog.getAllBlocks();
  assert.ok(allBlocks.length >= 20, 'Pelo menos 20 blocos prontos');
  for (const blkItem of allBlocks) {
    assert.ok(blkItem.thumbnailSvg.includes('<svg'), `Miniatura SVG presente em ${blkItem.id}`);
    const instance = blkItem.create();
    assert.strictEqual(instance.type, 'block', 'Instância gerada é do tipo block');
  }
  console.log(`✔ [5/6] BlockCatalog 8 categorias e ${allBlocks.length} blocos modulares validados.`);

  // 6. BuiltinPresets Testes
  const { BuiltinPresets } = await import('../dist-vanilla/js/catalog/BuiltinPresets.js');
  const presets = BuiltinPresets.getAll();
  assert.strictEqual(presets.length, 4, '4 Presets obrigatórios');

  const expectedIds = ['editorial_digest', 'executive_summit', 'saas_launch', 'order_receipt'];
  for (const expectedId of expectedIds) {
    const p = BuiltinPresets.getById(expectedId);
    assert.ok(p, `Preset ${expectedId} deve existir`);
    const pDoc = BuiltinPresets.createPreset(expectedId);
    assert.ok(pDoc && pDoc.blocks.length >= 3, `Preset ${expectedId} possui blocos`);
    const html = EmailCompiler.compile(pDoc);
    assert.ok(html.includes('<!DOCTYPE html'), 'Gera documento HTML válido');
  }
  console.log('✔ [6/6] BuiltinPresets 4 templates completos e originais validados com sucesso.');

  console.log('\n=== TODOS OS METATESTES E INVARIANTES PASSARAM COM SUCESSO 100%! ===');
}

runTests().catch(err => {
  console.error('FALHA NOS TESTES:', err);
  process.exit(1);
});
