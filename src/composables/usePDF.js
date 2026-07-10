import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export function usePDF() {
  const exportarParaPDF = (matches, filtro, ano, totais, porcentagem, formatScore) => {
    const doc = new jsPDF()
    doc.setFillColor(19, 48, 28); doc.rect(0, 0, 220, 25, 'F')
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
    doc.text("MACHADO'S GRAND SLAM - RELATÓRIO", 14, 16)
    doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
    doc.text(`Filtro: ${filtro}s | Ano: ${ano}`, 14, 33)
    doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 38)
    doc.setFillColor(244, 247, 244); doc.rect(14, 44, 182, 32, 'F')
    doc.setTextColor(19, 48, 28); doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
    doc.text("RESUMO", 18, 51)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(51, 65, 85)
    doc.text(`Gustavo: ${totais.jogosFilho} vitórias (${porcentagem.j1}%) | Sets: ${totais.setsFilho} | Games: ${totais.gamesFilho}`, 18, 59)
    doc.text(`Otávio: ${totais.jogosPai} vitórias (${porcentagem.j2}%) | Sets: ${totais.setsPai} | Games: ${totais.gamesPai}`, 18, 65)
    doc.text(`Pneus: Gustavo ${totais.pneusFilho} x ${totais.pneusPai} Otávio`, 18, 71)
    doc.setTextColor(19, 48, 28); doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
    doc.text("CONFRONTOS", 14, 86)
    doc.autoTable({
      startY: 92,
      head: [["Data", "Local", "Superfície", "Tipo", "Vencedor", "Placar"]],
      body: matches.value.map(m => [
        m.data || '', m.local || '', m.quadra || '', m.tipo || '',
        m.status === 'Incompleto' ? 'Em Aberto' : (m.vencedor_id === 1 ? 'Gustavo' : 'Otávio'),
        formatScore(m)
      ]),
      headStyles: { fillColor: [19, 48, 28], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2.5 }, theme: 'striped'
    })
    doc.save(`grand-slam-${filtro}-${ano}.pdf`)
  }
  return { exportarParaPDF }
}
