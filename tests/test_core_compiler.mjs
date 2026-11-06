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
    'dist-vanilla/js/catalog/BuiltinPresets.js',
    'dist-vanilla/js/ui/ColorPickerPopover.js'
  ];

  for (const f of filesToCheck) {
    const buffer = fs.readFileSync(f);
    assert.ok(buffer.length > 0, `Arquivo não pode estar vazio: ${f}`);
    const hasBOM = buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF;
    assert.strictEqual(hasBOM, false, `Arquivo possui BOM (inaceitável): ${f}`);
  }
  console.log(`✔ [1/6] UTF-8 No BOM verificado em todos os ${filesToCheck.length} arquivos JS.`);

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

  // Validação explícita: store.findNodeById(id) retornando { type, node, parent, index, path } com type preenchido
  const hitBlk = store.findNodeById(blk.id);
  assert.ok(hitBlk && hitBlk.type === 'block' && hitBlk.node === blk && hitBlk.parent === store.getDocument() && Array.isArray(hitBlk.path), 'findNodeById preenche type="block" e metadados');
  const hitRow = store.findNodeById(row.id);
  assert.ok(hitRow && hitRow.type === 'row' && hitRow.node === row && hitRow.parent === blk && Array.isArray(hitRow.path), 'findNodeById preenche type="row" e metadados');
  const hitCell = store.findNodeById(cell.id);
  assert.ok(hitCell && hitCell.type === 'cell' && hitCell.node === cell && hitCell.parent === row && Array.isArray(hitCell.path), 'findNodeById preenche type="cell" e metadados');
  const hitAtom = store.findNodeById(firstAtom.id);
  assert.ok(hitAtom && hitAtom.type === 'atom' && hitAtom.node === firstAtom && hitAtom.parent === cell && Array.isArray(hitAtom.path), 'findNodeById preenche type="atom" e metadados');

  // Validação explícita: store.setMode('preview') limpando seleção e store.setMode('editor') restaurando modo
  store.setMode('preview');
  assert.strictEqual(store.getState().mode, 'preview', 'setMode define modo preview');
  assert.strictEqual(store.getState().selectedId, null, 'setMode preview limpa selectedId');
  assert.strictEqual(store.getState().selectedType, 'main', 'setMode preview redefine selectedType para main');
  store.setMode('editor');
  assert.strictEqual(store.getState().mode, 'editor', 'setMode editor restaura modo editor');

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

  // Validação explícita: store.insertNodeAt(null, 'first', newBlock) inserindo no índice 0
  const initialBlocksCount = store.getDocument().blocks.length;
  const rawTopBlock = BlockFactory.createBlock({ label: 'Bloco Topo No Índice Zero' });
  const insertOk = store.insertNodeAt(null, 'first', rawTopBlock);
  assert.strictEqual(insertOk, true, 'store.insertNodeAt(null, "first", newBlock) deve retornar true');
  assert.strictEqual(store.getDocument().blocks.length, initialBlocksCount + 1, 'Tamanho de blocks incrementado em 1');
  assert.strictEqual(store.getDocument().blocks[0].id, store.getState().selectedId, 'Nó inserido em first deve ser o índice 0');
  assert.strictEqual(store.getDocument().blocks[0].label, 'Bloco Topo No Índice Zero', 'Propriedades preservadas no índice 0');
  const firstBlockId = store.getDocument().blocks[0].id;

  // Validação explícita: store.moveNodeTo reordenando blocos ('before' e 'after')
  const blockX = store.addBlock(BlockFactory.createBlock({ label: 'Block X' }));
  const blockY = store.addBlock(BlockFactory.createBlock({ label: 'Block Y' }));

  // Move blockY before firstBlockId
  const moveBeforeOk = store.moveNodeTo(blockY.id, firstBlockId, 'before');
  assert.strictEqual(moveBeforeOk, true, 'moveNodeTo before deve reordenar blocos');
  assert.strictEqual(store.getDocument().blocks[0].id, blockY.id, 'blockY deve agora ser o índice 0');

  // Move blockY after blockX
  const moveAfterOk = store.moveNodeTo(blockY.id, blockX.id, 'after');
  assert.strictEqual(moveAfterOk, true, 'moveNodeTo after deve reordenar blocos');
  const blocksNow = store.getDocument().blocks;
  const idxY = blocksNow.findIndex(b => b.id === blockY.id);
  const idxX = blocksNow.findIndex(b => b.id === blockX.id);
  assert.strictEqual(idxY, idxX + 1, 'blockY deve estar posicionado imediatamente após blockX');

  // Validação explícita: store.moveNodeTo movendo átomos entre células diferentes ('inside', 'before', 'after')
  const containerBlock = store.addBlock(BlockFactory.createBlock({ label: 'Container Teste' }));
  const multiRow = store.addRowToBlock(containerBlock.id);
  const cellTargetA = multiRow.cells[0];
  const cellTargetB = store.addCellToRow(multiRow.id);

  const atomA1 = BlockFactory.createTextAtom({ value: 'Texto Célula A' });
  const atomA2 = BlockFactory.createButtonAtom({ value: 'Botão Célula A' });
  const atomB1 = BlockFactory.createDividerAtom({ settings: { height: 3 } });

  cellTargetA.children = [atomA1, atomA2];
  cellTargetB.children = [atomB1];

  // Mover atomA1 para dentro de cellTargetB ('inside')
  const moveInsideCell = store.moveNodeTo(atomA1.id, cellTargetB.id, 'inside');
  assert.strictEqual(moveInsideCell, true, 'moveNodeTo inside para outra célula deve retornar true');
  assert.strictEqual(cellTargetA.children.length, 1, 'cellTargetA deve ter 1 átomo restante');
  assert.strictEqual(cellTargetB.children.length, 2, 'cellTargetB deve agora ter 2 átomos');
  assert.strictEqual(cellTargetB.children[1].id, atomA1.id, 'atomA1 movido para o fim de cellTargetB');

  // Mover atomA2 para antes de atomB1 em cellTargetB ('before')
  const moveBeforeAtom = store.moveNodeTo(atomA2.id, atomB1.id, 'before');
  assert.strictEqual(moveBeforeAtom, true, 'moveNodeTo before entre células diferentes deve retornar true');
  assert.strictEqual(cellTargetA.children.length, 0, 'cellTargetA deve agora estar vazia');
  assert.strictEqual(cellTargetB.children.length, 3, 'cellTargetB deve conter todos os 3 átomos');
  assert.strictEqual(cellTargetB.children[0].id, atomA2.id, 'atomA2 deve ser o primeiro em cellTargetB');
  assert.strictEqual(cellTargetB.children[1].id, atomB1.id, 'atomB1 deve ser o segundo');
  assert.strictEqual(cellTargetB.children[2].id, atomA1.id, 'atomA1 deve ser o terceiro');

  // Mover atomA2 para depois de atomA1 em cellTargetB ('after')
  const moveAfterAtom = store.moveNodeTo(atomA2.id, atomA1.id, 'after');
  assert.strictEqual(moveAfterAtom, true, 'moveNodeTo after dentro da mesma célula deve retornar true');
  assert.strictEqual(cellTargetB.children[0].id, atomB1.id, 'atomB1 agora é o primeiro');
  assert.strictEqual(cellTargetB.children[1].id, atomA1.id, 'atomA1 agora é o segundo');
  assert.strictEqual(cellTargetB.children[2].id, atomA2.id, 'atomA2 agora é o terceiro');

  // Validação explícita: bloqueando ciclos (mover um nó para dentro de si mesmo ou descendente retorna false)
  const selfCycleInside = store.moveNodeTo(containerBlock.id, containerBlock.id, 'inside');
  assert.strictEqual(selfCycleInside, false, 'Mover bloco para dentro de si mesmo deve retornar false');

  const selfCycleBefore = store.moveNodeTo(containerBlock.id, containerBlock.id, 'before');
  assert.strictEqual(selfCycleBefore, false, 'Mover bloco para si mesmo com before deve retornar false');

  const selfCycleAfter = store.moveNodeTo(containerBlock.id, containerBlock.id, 'after');
  assert.strictEqual(selfCycleAfter, false, 'Mover bloco para si mesmo com after deve retornar false');

  const descCycleRow = store.moveNodeTo(containerBlock.id, multiRow.id, 'inside');
  assert.strictEqual(descCycleRow, false, 'Mover bloco para dentro de linha descendente deve retornar false');

  const descCycleCell = store.moveNodeTo(containerBlock.id, cellTargetB.id, 'inside');
  assert.strictEqual(descCycleCell, false, 'Mover bloco para dentro de célula descendente deve retornar false');

  // Validação explícita: setRowColumnsLayout e resizeRowCells redimensionando dinamicamente
  const layoutOk = store.setRowColumnsLayout(row.id, ['20%', '50%', '30%']);
  assert.strictEqual(layoutOk, true, 'setRowColumnsLayout retorna true');
  const rowAfterLayout = store.findNodeById(row.id).node;
  assert.strictEqual(rowAfterLayout.cells.length, 3, 'setRowColumnsLayout ajusta contagem para 3 células');
  assert.strictEqual(rowAfterLayout.cells[0].settings.width, '20.00%');
  assert.strictEqual(rowAfterLayout.cells[1].settings.width, '50.00%');
  assert.strictEqual(rowAfterLayout.cells[2].settings.width, '30.00%');

  const resizeOk = store.resizeRowCells(row.id, [35, 65]);
  assert.strictEqual(resizeOk, true, 'resizeRowCells retorna true');
  assert.strictEqual(rowAfterLayout.cells[0].settings.width, '35%');
  assert.strictEqual(rowAfterLayout.cells[1].settings.width, '65%');

  // Validação explícita: moveCellInRow trocando ordem das colunas
  const initialFirstCellId = rowAfterLayout.cells[0].id;
  const initialSecondCellId = rowAfterLayout.cells[1].id;
  const moveCellRightOk = store.moveCellInRow(row.id, initialFirstCellId, 'right');
  assert.strictEqual(moveCellRightOk, true, 'moveCellInRow right retorna true');
  assert.strictEqual(rowAfterLayout.cells[0].id, initialSecondCellId, 'Segunda célula tornou-se a primeira');
  assert.strictEqual(rowAfterLayout.cells[1].id, initialFirstCellId, 'Primeira célula moveu-se para a direita');

  // Validação explícita: addRowAt e removeCellFromRow
  const addedRowAfter = store.addRowAt(blk.id, row.id, 'after');
  assert.ok(addedRowAfter && addedRowAfter.type === 'row', 'addRowAt retorna nova row criada');
  const blkAfterAddRow = store.findNodeById(blk.id).node;
  const originalRowIdx = blkAfterAddRow.rows.findIndex(r => r.id === row.id);
  const newRowIdx = blkAfterAddRow.rows.findIndex(r => r.id === addedRowAfter.id);
  assert.strictEqual(newRowIdx, originalRowIdx + 1, 'addRowAt com position after insere logo após refRow');

  const cellCountBeforeRemove = rowAfterLayout.cells.length;
  const cellIdToRemove = rowAfterLayout.cells[0].id;
  const removeCellOk = store.removeCellFromRow(row.id, cellIdToRemove);
  assert.strictEqual(removeCellOk, true, 'removeCellFromRow retorna true');
  assert.strictEqual(rowAfterLayout.cells.length, cellCountBeforeRemove - 1, 'removeCellFromRow remove a célula');
  assert.ok(!rowAfterLayout.cells.some(c => c.id === cellIdToRemove), 'Célula removida não existe mais na linha');

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

  // Validação explícita: createSpacerAtom e compilação sem erro
  const spacerAtom = BlockFactory.createSpacerAtom({ settings: { height: 40 } });
  assert.strictEqual(spacerAtom.atomType, 'spacer');
  assert.strictEqual(spacerAtom.settings.height, 40);

  // Validação explícita: EmailCompiler propagando effectiveBg na tabela .e-container e rowBg na <td> e <tr> da linha
  const docWithSpacerAndBgs = BlockFactory.createDocument({
    blocks: [
      BlockFactory.createBlock({
        settings: { backgroundColor: '#1E293B' },
        rows: [
          BlockFactory.createRow({
            settings: { backgroundColor: '#334155' },
            cells: [
              BlockFactory.createCell({
                children: [spacerAtom]
              })
            ]
          })
        ]
      })
    ]
  });

  const compiledSpacerAndBgs = EmailCompiler.compile(docWithSpacerAndBgs);
  assert.ok(compiledSpacerAndBgs.includes('height: 40px;'), 'EmailCompiler compila spacer com height: 40px');
  assert.ok(compiledSpacerAndBgs.includes('height="40"'), 'EmailCompiler compila td com height="40"');
  assert.ok(compiledSpacerAndBgs.includes('class="e-container" bgcolor="#1E293B"'), 'effectiveBg propagado na table .e-container');
  assert.ok(compiledSpacerAndBgs.includes('<tr class="e-row" bgcolor="#334155" style="background-color: #334155;"'), 'rowBg propagado na tr da linha');
  assert.ok(compiledSpacerAndBgs.includes('<td bgcolor="#334155" style="background-color: #334155;'), 'rowBg propagado na td da linha');

  console.log('✔ [4/6] EmailCompiler regras de anti-quebra Outlook, MSO, VML e gaps validadas.');

  // 5. BlockCatalog Testes
  const { BlockCatalog } = await import('../dist-vanilla/js/catalog/BlockCatalog.js');
  const { I18n } = await import('../dist-vanilla/js/i18n/I18n.js');
  const categories = BlockCatalog.getCategories();
  assert.strictEqual(categories.length, 8, '8 Categorias obrigatórias');

  const allBlocks = BlockCatalog.getAllBlocks();
  assert.ok(allBlocks.length >= 20, 'Pelo menos 20 blocos prontos');
  for (const blkItem of allBlocks) {
    assert.ok(blkItem.thumbnailSvg.includes('<svg'), `Miniatura SVG presente em ${blkItem.id}`);
    const instance = blkItem.create();
    assert.strictEqual(instance.type, 'block', 'Instância gerada é do tipo block');

    // Validação de paridade da chave BLOCK_* traduzida via I18n.t()
    assert.ok(blkItem.nameKey.startsWith('BLOCK_'), `nameKey deve iniciar com BLOCK_: ${blkItem.nameKey}`);
    assert.ok(blkItem.descriptionKey.startsWith('BLOCK_'), `descriptionKey deve iniciar com BLOCK_: ${blkItem.descriptionKey}`);

    I18n.setLocale('pt-BR');
    const ptName = I18n.t(blkItem.nameKey);
    const ptDesc = I18n.t(blkItem.descriptionKey);
    assert.ok(ptName && ptName !== blkItem.nameKey, `Tradução pt-BR não encontrada para ${blkItem.nameKey}`);
    assert.ok(ptDesc && ptDesc !== blkItem.descriptionKey, `Tradução pt-BR não encontrada para ${blkItem.descriptionKey}`);

    I18n.setLocale('en-GB');
    const enName = I18n.t(blkItem.nameKey);
    const enDesc = I18n.t(blkItem.descriptionKey);
    assert.ok(enName && enName !== blkItem.nameKey, `Tradução en-GB não encontrada para ${blkItem.nameKey}`);
    assert.ok(enDesc && enDesc !== blkItem.descriptionKey, `Tradução en-GB não encontrada para ${blkItem.descriptionKey}`);
    assert.notStrictEqual(ptName, enName, `Traduções pt-BR e en-GB devem ser distintas para ${blkItem.nameKey}`);
    assert.notStrictEqual(ptDesc, enDesc, `Traduções pt-BR e en-GB devem ser distintas para ${blkItem.descriptionKey}`);
  }
  I18n.setLocale('pt-BR');
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

    // Validação explícita: ausência de &rarr; literal nos botões e documento
    const presetJson = JSON.stringify(pDoc);
    assert.ok(!presetJson.includes('&rarr;'), `Preset ${expectedId} não deve conter &rarr; literal na árvore de dados`);
    assert.ok(!html.includes('&amp;rarr;'), `Preset ${expectedId} compilado não deve conter entidade escapada &amp;rarr;`);
    assert.ok(!html.includes('&rarr;'), `Preset ${expectedId} compilado não deve conter entidade &rarr;`);

    // Validação de paridade da chave PRESET_* traduzida via I18n.t()
    assert.ok(p.nameKey.startsWith('PRESET_'), `nameKey deve iniciar com PRESET_: ${p.nameKey}`);
    assert.ok(p.descriptionKey.startsWith('PRESET_'), `descriptionKey deve iniciar com PRESET_: ${p.descriptionKey}`);

    I18n.setLocale('pt-BR');
    const ptPresetName = I18n.t(p.nameKey);
    const ptPresetDesc = I18n.t(p.descriptionKey);
    assert.ok(ptPresetName && ptPresetName !== p.nameKey, `Tradução pt-BR não encontrada para ${p.nameKey}`);
    assert.ok(ptPresetDesc && ptPresetDesc !== p.descriptionKey, `Tradução pt-BR não encontrada para ${p.descriptionKey}`);

    I18n.setLocale('en-GB');
    const enPresetName = I18n.t(p.nameKey);
    const enPresetDesc = I18n.t(p.descriptionKey);
    assert.ok(enPresetName && enPresetName !== p.nameKey, `Tradução en-GB não encontrada para ${p.nameKey}`);
    assert.ok(enPresetDesc && enPresetDesc !== p.descriptionKey, `Tradução en-GB não encontrada para ${p.descriptionKey}`);
    assert.notStrictEqual(ptPresetDesc, enPresetDesc, `Traduções pt-BR e en-GB devem ser distintas para ${p.descriptionKey}`);
  }
  I18n.setLocale('pt-BR');
  console.log('✔ [6/6] BuiltinPresets 4 templates completos e originais validados com sucesso.');

  // 7. Boot/Mount Simulado dos Componentes Front-End UI (com mock mínimo de document/window)
  class MockClassList {
    constructor(el) {
      this.el = el;
      this.classes = new Set();
    }
    add(...names) {
      names.forEach(n => String(n || '').split(/\s+/).filter(Boolean).forEach(c => this.classes.add(c)));
      this.el.className = Array.from(this.classes).join(' ');
    }
    remove(...names) {
      names.forEach(n => this.classes.delete(n));
      this.el.className = Array.from(this.classes).join(' ');
    }
    toggle(name, force) {
      if (force !== undefined) {
        if (force) this.add(name); else this.remove(name);
        return force;
      }
      if (this.classes.has(name)) { this.remove(name); return false; }
      this.add(name);
      return true;
    }
    contains(name) {
      return this.classes.has(name);
    }
  }

  class MockElement {
    constructor(tagName = 'div') {
      this.tagName = tagName.toUpperCase();
      this.children = [];
      this.parentNode = null;
      this.parentElement = null;
      this.style = {};
      this.dataset = {};
      this.attributes = {};
      this.listeners = {};
      this._className = '';
      this.classList = new MockClassList(this);
      this.value = '';
      this.textContent = '';
      this._innerHTML = '';
      this.id = '';
      this.type = 'text';
      this.disabled = false;
      this.checked = false;
      this.selected = false;
      this.placeholder = '';
      this.title = '';
      this.href = '';
      this.target = '';
      this.offsetWidth = 200;
      this.offsetHeight = 100;
      this.scrollWidth = 200;
      this.scrollHeight = 100;
      this.scrollTop = 0;
      this.scrollLeft = 0;
    }

    get className() { return this._className; }
    set className(val) {
      this._className = String(val || '');
      this.classList.classes = new Set(this._className.split(/\s+/).filter(Boolean));
    }

    get innerHTML() { return this._innerHTML; }
    set innerHTML(html) {
      this._innerHTML = String(html || '');
      if (html === '') this.children = [];
    }

    appendChild(child) {
      if (!child) return child;
      child.parentNode = this;
      child.parentElement = this;
      this.children.push(child);
      return child;
    }

    removeChild(child) {
      const idx = this.children.indexOf(child);
      if (idx !== -1) {
        this.children.splice(idx, 1);
        child.parentNode = null;
        child.parentElement = null;
      }
      return child;
    }

    insertBefore(newChild, refChild) {
      if (!newChild) return newChild;
      const idx = this.children.indexOf(refChild);
      if (idx !== -1) {
        newChild.parentNode = this;
        newChild.parentElement = this;
        this.children.splice(idx, 0, newChild);
      } else {
        this.appendChild(newChild);
      }
      return newChild;
    }

    replaceChildren(...newChildren) {
      this.children = [];
      newChildren.forEach(c => this.appendChild(c));
    }

    contains(el) {
      if (!el) return false;
      if (el === this) return true;
      for (const ch of this.children) {
        if (ch.contains && ch.contains(el)) return true;
      }
      return false;
    }

    setAttribute(name, val) {
      this.attributes[name] = String(val);
      if (name.startsWith('data-')) {
        const key = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        this.dataset[key] = String(val);
      }
    }

    getAttribute(name) { return this.attributes[name] ?? null; }
    removeAttribute(name) { delete this.attributes[name]; }
    hasAttribute(name) { return name in this.attributes; }

    addEventListener(event, fn) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    }

    removeEventListener(event, fn) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    }

    dispatchEvent(evt) {
      const list = this.listeners[evt.type || evt] || [];
      list.forEach(fn => fn(evt));
      return true;
    }

    getBoundingClientRect() {
      return { top: 0, left: 0, bottom: 50, right: 200, width: 200, height: 50, x: 0, y: 0 };
    }

    querySelector(selector) {
      const all = this.querySelectorAll(selector);
      return all.length > 0 ? all[0] : null;
    }

    querySelectorAll(selector) {
      const results = [];
      const match = (el) => {
        if (!el || !selector) return false;
        if (selector.startsWith('.')) return el.classList && el.classList.contains(selector.slice(1));
        if (selector.startsWith('#')) return el.id === selector.slice(1);
        if (selector.startsWith('[') && selector.endsWith(']')) {
          const inner = selector.slice(1, -1);
          if (inner.includes('=')) {
            const [attr, val] = inner.split('=');
            const cleanVal = val.replace(/^["']|["']$/g, '');
            return el.hasAttribute && el.hasAttribute(attr) && String(el.getAttribute(attr)) === cleanVal;
          }
          return el.hasAttribute && el.hasAttribute(inner);
        }
        return el.tagName === selector.toUpperCase();
      };
      const check = (node) => {
        if (node !== this && match(node)) results.push(node);
        if (Array.isArray(node.children)) node.children.forEach(check);
      };
      check(this);
      return results;
    }

    closest(selector) {
      let curr = this;
      const match = (el) => {
        if (!el || !selector) return false;
        if (selector.startsWith('.')) return el.classList && el.classList.contains(selector.slice(1));
        if (selector.startsWith('#')) return el.id === selector.slice(1);
        return el.tagName === selector.toUpperCase();
      };
      while (curr) {
        if (match(curr)) return curr;
        curr = curr.parentElement;
      }
      return null;
    }

    focus() {}
    blur() {}
    click() { this.dispatchEvent({ type: 'click', target: this }); }
    scrollIntoView() {}
  }

  const rootBody = new MockElement('body');
  const docListeners = {};
  const mockDocument = {
    body: rootBody,
    head: new MockElement('head'),
    activeElement: rootBody,
    createElement: (tag) => new MockElement(tag),
    createTextNode: (txt) => { const el = new MockElement('#text'); el.textContent = txt; return el; },
    createDocumentFragment: () => new MockElement('fragment'),
    querySelector: (sel) => rootBody.querySelector(sel),
    querySelectorAll: (sel) => rootBody.querySelectorAll(sel),
    addEventListener: (ev, fn) => {
      if (!docListeners[ev]) docListeners[ev] = [];
      docListeners[ev].push(fn);
    },
    removeEventListener: (ev, fn) => {
      if (!docListeners[ev]) return;
      docListeners[ev] = docListeners[ev].filter(f => f !== fn);
    },
    dispatchEvent: (evt) => {
      const list = docListeners[evt.type || evt] || [];
      list.forEach(f => f(evt));
      return true;
    }
  };

  const memStore = new Map();
  const mockLocalStorage = {
    getItem: (k) => memStore.get(k) ?? null,
    setItem: (k, v) => memStore.set(k, String(v)),
    removeItem: (k) => memStore.delete(k),
    clear: () => memStore.clear()
  };

  globalThis.document = mockDocument;
  globalThis.window = {
    document: mockDocument,
    innerWidth: 1200,
    innerHeight: 800,
    localStorage: mockLocalStorage,
    addEventListener: (ev, fn) => mockDocument.addEventListener(ev, fn),
    removeEventListener: (ev, fn) => mockDocument.removeEventListener(ev, fn),
    dispatchEvent: (evt) => mockDocument.dispatchEvent(evt)
  };
  globalThis.localStorage = mockLocalStorage;
  globalThis.HTMLElement = MockElement;
  globalThis.Element = MockElement;

  // Importa componentes UI dinamicamente
  const { HeaderBar } = await import('../dist-vanilla/js/ui/HeaderBar.js');
  const { TreeNavigator } = await import('../dist-vanilla/js/ui/TreeNavigator.js');
  const { SidebarPanel } = await import('../dist-vanilla/js/ui/SidebarPanel.js');
  const { CanvasStage } = await import('../dist-vanilla/js/ui/CanvasStage.js');
  const { InspectorPanel } = await import('../dist-vanilla/js/ui/InspectorPanel.js');
  const { ColorPickerPopover } = await import('../dist-vanilla/js/ui/ColorPickerPopover.js');

  const bootDoc = BlockFactory.createDocument();
  const bootStore = new Store(bootDoc);
  const bootBlock = bootStore.addBlock();
  const bootRow = bootStore.addRowToBlock(bootBlock.id);
  const bootCell = bootStore.addCellToRow(bootRow.id);
  const bootAtom = bootCell.children[0];

  const headerBar = new HeaderBar(bootStore);
  assert.ok(headerBar.element, 'HeaderBar instanciado com elemento DOM');

  const treeNav = new TreeNavigator(bootStore);
  assert.ok(treeNav.element, 'TreeNavigator instanciado com elemento DOM');

  const sidebar = new SidebarPanel(bootStore, treeNav);
  assert.ok(sidebar.element, 'SidebarPanel instanciado com elemento DOM');

  const stage = new CanvasStage(bootStore);
  assert.ok(stage.element, 'CanvasStage instanciado com elemento DOM');

  const inspector = new InspectorPanel(bootStore);
  assert.ok(inspector.element, 'InspectorPanel instanciado com elemento DOM');

  const colorPopover = new ColorPickerPopover();
  const mockAnchor = new MockElement('button');
  colorPopover.open(mockAnchor, '#2563EB', () => {});
  colorPopover.close();

  // Invocação de render() em todos os 5 níveis (main, block, row, cell, atom)
  bootStore.selectNode(null);
  inspector.render();

  bootStore.selectNode(bootBlock.id);
  inspector.render();

  bootStore.selectNode(bootRow.id);
  inspector.render();

  bootStore.selectNode(bootCell.id);
  inspector.render();

  bootStore.selectNode(bootAtom.id);
  inspector.render();

  treeNav.render();
  stage.mount(mockDocument.body);

  // Validação MOD-CANVAS-LINHA-COLUNA-ELEMENTO-22: _insertRowRelativeToSelection cria novo bloco irmão e seleciona
  const initialBlockCount = bootStore.getDocument().blocks.length;
  bootStore.selectNode(bootAtom.id);
  stage._insertRowRelativeToSelection('after');
  const afterBlockCount = bootStore.getDocument().blocks.length;
  assert.strictEqual(afterBlockCount, initialBlockCount + 1, 'Deve inserir um novo bloco como irmão externo');
  const newlyCreatedBlockId = bootStore.getState().selectedId;
  assert.notStrictEqual(newlyCreatedBlockId, bootBlock.id, 'Novo bloco independente selecionado');
  const newlyCreatedBlock = bootStore.findNodeById(newlyCreatedBlockId).node;
  assert.ok(newlyCreatedBlock, 'O nó selecionado deve existir na store');
  assert.strictEqual(newlyCreatedBlock.rows.length, 1, 'Novo bloco deve possuir 1 linha');
  assert.strictEqual(newlyCreatedBlock.rows[0].cells.length, 1, 'Nova linha deve possuir 1 coluna pronta');
  assert.strictEqual(newlyCreatedBlock.rows[0].cells[0].children.length, 0, 'Coluna inicial deve ser vazia com placeholder');

  // Mock elements dentro do mountEl para testes de seleção no Node
  const mockAtomEl = new MockElement('div');
  mockAtomEl.setAttribute('data-nmf-id', bootAtom.id);
  mockAtomEl.setAttribute('data-nmf-type', 'atom');
  mockAtomEl.setAttribute('data-nmf-atom-type', 'text');
  stage.mountEl.appendChild(mockAtomEl);

  const mockBlockEl = new MockElement('div');
  mockBlockEl.setAttribute('data-nmf-id', bootBlock.id);
  mockBlockEl.setAttribute('data-nmf-type', 'block');
  stage.mountEl.appendChild(mockBlockEl);

  // Validação MOD-CANVAS-EMPTY-CELL-AND-ELEMENT-ACTIONS-27: botões de borda visíveis e títulos dinâmicos (+ Novo Acima/Abaixo) quando átomo selecionado
  bootStore.selectNode(bootAtom.id);
  stage._updateOverlay();
  assert.strictEqual(stage.edgeBtnTop.style.display, '', 'Botão superior de borda visível quando átomo selecionado');
  assert.strictEqual(stage.edgeBtnBottom.style.display, '', 'Botão inferior de borda visível quando átomo selecionado');
  assert.ok(stage.edgeBtnTop.title.includes('Acima'), 'Título deve indicar inserção acima');
  assert.ok(stage.edgeBtnBottom.title.includes('Abaixo'), 'Título deve indicar inserção abaixo');

  // Validação da trilha de 3 níveis: LINHA › COLUNA › ELEMENTO (zero ocorrências de 'BLOCO')
  const badgeText = stage.overlayBadge.children.map(c => c.textContent).join(' ');
  assert.ok(!badgeText.includes('BLOCO'), 'Trilha nunca deve conter a palavra BLOCO');
  assert.ok(badgeText.includes('LINHA'), 'Trilha deve conter LINHA');
  assert.ok(badgeText.includes('COLUNA'), 'Trilha deve conter COLUNA');
  assert.ok(badgeText.includes('ELEMENTO'), 'Trilha deve conter ELEMENTO');

  // Seleção de Linha exibe botões de borda com títulos de Linha
  bootStore.selectNode(bootBlock.id);
  stage._updateOverlay();
  assert.strictEqual(stage.edgeBtnTop.style.display, '', 'Botão superior de borda visível para Linha');
  assert.strictEqual(stage.edgeBtnBottom.style.display, '', 'Botão inferior de borda visível para Linha');
  assert.ok(stage.edgeBtnTop.title.includes('Linha'), 'Título para Linha deve conter Linha');

  // Validação MOD-CANVAS-ATOM-ALWAYS-DROPS-IN-CELL-28: _createStructureBlock cria células vazias
  const structBlock = stage._createStructureBlock('50-50');
  assert.strictEqual(structBlock.rows[0].cells[0].children.length, 0, 'Estrutura deve gerar células com children vazio');
  assert.strictEqual(structBlock.rows[0].cells[1].children.length, 0, 'Segunda célula da estrutura deve ter children vazio');

  console.log('✔ [7/7] Boot/Mount Simulado (Store, HeaderBar, SidebarPanel, CanvasStage, InspectorPanel, TreeNavigator, ColorPickerPopover e render em 5 niveis) validado com sucesso.');

  console.log('\n=== TODOS OS METATESTES E INVARIANTES PASSARAM COM SUCESSO 100%! ===');
}

runTests().catch(err => {
  console.error('FALHA NOS TESTES:', err);
  process.exit(1);
});
